import m from "mithril";
import ConcertState from "../models/ConcertState.js";
import Navbar from "../components/Navbar.js";
import PhotoGrid from "../components/PhotoGrid.js";
import Settings from "../models/Settings.js"; // MANTRA SAKTI: Memanggil Setting Global

// --- FUNGSI PENGUBAH LINK VIDEO GOOGLE DRIVE ---
const formatVideoEmbed = (url) => {
  if (!url) return "";
  const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/);
  if (match && match[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url; 
};

const ConcertLayout = () => {
  let isLoading = false;
  let previousId = null;
  let isOpen = false;
  
  // --- STATE UNTUK AI CHATBOT ---
  let isChatOpen = false;
  let chatMessage = "";
  let isAiTyping = false;
  let chatHistory = [
    { role: "ai", text: "Halo bro! Gue asisten AI Teman Konser. Ada yang pengen ditanyain seputar web ini?" }
  ];

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    chatHistory.push({ role: "user", text: userText });
    chatMessage = "";
    isAiTyping = true;
    m.redraw(); 

    const alamatServer = window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api";

    try {
      const res = await m.request({
        method: "POST",
        url: `${alamatServer}/tanya`, 
        body: { pesan: userText }
      });
      chatHistory.push({ role: "ai", text: res.reply });
    } catch (error) {
      chatHistory.push({ role: "ai", text: Settings.lang === "id" ? "Duh, koneksi ke otak AI gue lagi gangguan nih." : "Oops, my AI brain connection is down." });
    } finally {
      isAiTyping = false;
    }
  };

  // --- STATE UNTUK ANIMASI KETIK (TYPEWRITER) DINAMIS ---
  let currentText = "";
  let isDeleting = false;
  let loopNum = 0;
  let typeTimer = null;

  const runTypewriter = () => {
    const checkId = m.route.param("id") || "home";
    if (checkId !== "home") {
      typeTimer = setTimeout(runTypewriter, 1000); 
      return; 
    }

    // Array kata menyesuaikan bahasa
    const words = Settings.lang === "id" 
      ? ["Teman Konser Festival", "Ruang Arsip Digital", "Memori Area Moshpit"]
      : ["Teman Konser Festival", "Digital Archive Room", "Moshpit Memories"];

    const i = loopNum % words.length;
    const fullText = words[i];

    if (isDeleting) {
      currentText = fullText.substring(0, currentText.length - 1);
    } else {
      currentText = fullText.substring(0, currentText.length + 1);
    }
    
    m.redraw(); 

    let typingSpeed = isDeleting ? 40 : 100;
    if (!isDeleting && currentText === fullText) {
      typingSpeed = 2000; 
      isDeleting = true;
    } else if (isDeleting && currentText === "") {
      isDeleting = false;
      loopNum++;
      typingSpeed = 500; 
    }
    typeTimer = setTimeout(runTypewriter, typingSpeed);
  };

  return {
    oninit: async () => {
      if (ConcertState.list.length === 0) await ConcertState.loadConcerts();
      previousId = m.route.param("id") || "home";
      ConcertState.setConcert(previousId);

      const loader = document.getElementById("global-loader");
      if (loader) {
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 700);
      }

      isLoading = true;
      setTimeout(() => { isLoading = false; m.redraw(); }, 400);
      runTypewriter(); 
    },

    onremove: () => { if (typeTimer) clearTimeout(typeTimer); },

    onupdate: () => {
      const currentId = m.route.param("id") || "home";
      ConcertState.setConcert(currentId);
      if (currentId !== previousId) {
        previousId = currentId;
        isOpen = false; 
        isLoading = true;
        m.redraw();
        setTimeout(() => { isLoading = false; m.redraw(); }, 400); 
      }
    },

    view: () => {
      const rawParam = m.route.param("id") || "home";
      const currentId = decodeURIComponent(rawParam).toLowerCase().trim();
      const activeConcert = ConcertState.list?.find(c => {
        const cId = String(c.id || c._id || "").toLowerCase().trim();
        const cShort = String(c.shortTitle || "").toLowerCase().trim();
        const cTitle = String(c.title || "").toLowerCase().trim();
        return (cId === currentId || cShort === currentId || cTitle === currentId || cId.replace(/-/g, " ") === currentId.replace(/-/g, " "));
      });

      const hasVideos = activeConcert && activeConcert.videos && activeConcert.videos.length > 0;
      
      // --- DETEKSI TEMA (GELAP/TERANG) ---
      const isDark = Settings.theme === "dark";
      const bgRoot = isDark ? "bg-slate-900 text-slate-200" : "bg-slate-50 text-slate-800";
      const textHeading = isDark ? "text-white" : "text-slate-900";
      const textMuted = isDark ? "text-slate-400" : "text-slate-500";
      const bgCard = isDark ? "bg-slate-800/30 hover:bg-slate-800/70" : "bg-white hover:bg-slate-50 shadow-md";
      const borderCard = isDark ? "border-slate-700/50" : "border-slate-200";
      
      // --- TRANSLASI BAHASA INLINE ---
      const t = {
        welcome: Settings.lang === "id" 
          ? "Selamat datang di ruang arsip digital kita. Web ini dibuat khusus untuk mengabadikan setiap momen dan euforia yang kita rasakan bersama di area moshpit maupun tribun." 
          : "Welcome to our digital archive room. This website was created specifically to capture every moment and euphoria we experienced together in the moshpit and the grandstands.",
        hint: Settings.lang === "id" ? "Silakan klik menu di atas untuk berpindah ke laman dokumentasi." : "Please click the menu above to navigate to the documentation pages.",
        highlight: Settings.lang === "id" ? "Highlight Perjalanan" : "Journey Highlights",
        stats: Settings.lang === "id" 
          ? [{ t: "Total Gigs", v: "15+", d: "Konser & Festival" }, { t: "Koleksi", v: "300+", d: "Foto & Video Memori" }, { t: "Solidaritas", v: "100%", d: "Selalu Sing-along" }]
          : [{ t: "Total Gigs", v: "15+", d: "Concerts & Festivals" }, { t: "Collection", v: "300+", d: "Photo & Video Memories" }, { t: "Solidarity", v: "100%", d: "Always Sing-along" }],
        openDoc: Settings.lang === "id" ? "Buka Dokumentasi" : "Open Documentation",
        photoArc: Settings.lang === "id" ? "Arsip Foto" : "Photo Archives",
        videoArc: Settings.lang === "id" ? "Arsip Video" : "Video Archives",
        noVideo: Settings.lang === "id" ? "Belum ada arsip video untuk dokumentasi event ini." : "No video archives available for this event.",
        notFound: Settings.lang === "id" ? "Laman tidak ditemukan." : "Page not found.",
        connect: Settings.lang === "id" ? "Terkoneksi dengan Kami:" : "Connect with Us:"
      };

      return m("div", { class: `min-h-screen flex flex-col ${bgRoot} font-sans transition-colors duration-300`, key: "layout" },
        m(Navbar),
        
        m("main", { class: "container mx-auto p-4 md:p-8 flex-grow" },
          
          isLoading ? 
            m("div", { class: "flex flex-col items-center justify-center mt-32 animate-[pulse_0.5s_ease-out_infinite]" },
              m("div", { class: `w-12 h-12 border-4 ${isDark ? 'border-slate-700' : 'border-slate-300'} border-t-indigo-500 rounded-full animate-spin mb-4 shadow-lg` }),
              m("p", { class: `${textMuted} font-medium tracking-widest` }, Settings.lang === "id" ? "MEMUAT..." : "LOADING...")
            )
          :
            m("div", { class: "animate-[fadeIn_0.3s_ease-out_1]" },
              currentId === "home" ? 
                
                // --- HALAMAN BERANDA ---
                m("div", { class: "flex flex-col gap-20 mt-12 pb-16 items-center text-center" },
                  m("div", { class: "max-w-3xl mx-auto flex flex-col items-center gap-6" },
                    m("img", { src: "/temankonserlogo.png", alt: "Logo", class: "w-32 h-32 md:w-48 md:h-48 object-contain mx-auto drop-shadow-xl mb-2" }),
                    m("h1", { class: `text-4xl md:text-5xl font-bold ${textHeading} tracking-tight min-h-[3rem] md:min-h-[4rem] flex items-center justify-center` }, 
                      currentText,
                      m("span", { class: "text-indigo-500 animate-pulse font-light ml-1" }, "|") 
                    ),
                    m("p", { class: `text-lg ${textMuted} leading-relaxed` }, t.welcome),
                    m("div", { class: `w-16 h-1 ${isDark ? 'bg-slate-700' : 'bg-slate-300'} rounded-full my-2` }),
                    m("p", { class: `text-md ${isDark ? 'text-slate-500' : 'text-slate-400'}` }, t.hint)
                  ),

                  m("div", { class: "w-full max-w-4xl mx-auto" },
                    m("h2", { class: `text-2xl font-semibold ${textHeading} mb-8` }, t.highlight),
                    m("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                      t.stats.map((stat, index) => 
                        m("div", { 
                          class: `${bgCard} border ${borderCard} rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-700 ease-out transform translate-y-12 opacity-0 hover:-translate-y-2 cursor-default`,
                          oncreate: (vnode) => {
                            const observer = new IntersectionObserver((entries) => {
                              if (entries[0].isIntersecting) {
                                setTimeout(() => {
                                  vnode.dom.classList.remove("translate-y-12", "opacity-0");
                                  vnode.dom.classList.add("translate-y-0", "opacity-100");
                                }, index * 250 + 100); 
                                observer.unobserve(vnode.dom);
                              }
                            }, { threshold: 0.2 });
                            observer.observe(vnode.dom);
                          }
                        },
                          m("h3", { class: "text-4xl font-bold text-indigo-500 mb-2" }, stat.v),
                          m("p", { class: `font-medium text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}` }, stat.t),
                          m("p", { class: `text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}` }, stat.d)
                        )
                      )
                    )
                  )
                )

              : 
                
                // --- HALAMAN DOKUMENTASI KANAN KIRI ---
                (activeConcert ? 
                  m("div", { class: `${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-8 mb-10 text-center max-w-5xl mx-auto mt-4 shadow-xl transition-colors` },
                    m("h1", { class: `text-3xl md:text-4xl font-bold mb-4 ${textHeading}` }, activeConcert.title),
                    m("p", { class: `italic mb-8 ${textMuted}` }, `"${activeConcert.desc}"`),
                    
                    !isOpen ? 
                      m("button", {
                        class: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-md transform transition-all duration-300 hover:scale-105 shadow-lg",
                        onclick: () => { isOpen = true; }
                      }, t.openDoc)
                    : 
                      m("div", { class: "mt-12 animate-[fadeIn_0.5s_ease-out_1]" },
                        m("div", { class: "grid grid-cols-1 lg:grid-cols-2 gap-10 items-start text-left" },
                          
                          // KOLOM KIRI (FOTO)
                          m("div", { class: "w-full" },
                            m("div", { class: `flex items-center gap-3 mb-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} pb-3` },
                              m("span", { class: "text-2xl" }, "📷"),
                              m("h3", { class: `text-2xl font-bold ${textHeading}` }, t.photoArc)
                            ),
                            m("div", { class: `${isDark ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'} p-4 rounded-2xl border shadow-inner` },
                              m(PhotoGrid, { images: activeConcert.gallery })
                            )
                          ),

                          // KOLOM KANAN (VIDEO)
                          hasVideos ? 
                            m("div", { class: "w-full" },
                              m("div", { class: `flex items-center gap-3 mb-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} pb-3` },
                                m("span", { class: "text-2xl" }, "🎥"),
                                m("h3", { class: `text-2xl font-bold ${textHeading}` }, t.videoArc)
                              ),
                              m("div", { class: `grid grid-cols-1 sm:grid-cols-2 gap-4 ${isDark ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'} p-4 rounded-2xl border shadow-inner` },
                                (activeConcert.videos || []).map((vidUrl, index) => 
                                  m("div", { class: `w-full ${isDark ? 'bg-black/80' : 'bg-slate-800'} p-2 rounded-xl shadow-lg border border-slate-700 animate-[fadeIn_0.5s_ease-out_1]` },
                                    vidUrl.includes("drive.google.com") ? 
                                      m("iframe", { src: formatVideoEmbed(vidUrl), class: "w-full h-[300px] md:h-[400px] rounded-xl border-0", allowfullscreen: true, loading: "lazy", sandbox: "allow-scripts allow-same-origin allow-popups" })
                                    : 
                                      m("video", { src: vidUrl, class: "w-full h-[300px] md:h-[400px] object-contain rounded-xl bg-black shadow-inner", controls: true })
                                  )
                                )
                              )
                            ) 
                          : 
                            m("div", { class: `w-full flex flex-col items-center justify-center ${isDark ? 'bg-slate-900/30 border-slate-700/50' : 'bg-slate-100 border-slate-300'} p-10 rounded-2xl border border-dashed` },
                              m("span", { class: "text-4xl mb-3 opacity-50" }, "🎥"),
                              m("p", { class: `${isDark ? 'text-slate-500' : 'text-slate-400'} italic text-center` }, t.noVideo)
                            )
                        )
                      )
                  )
                : 
                  m("div", { class: `text-center ${textMuted} mt-20 text-lg` }, t.notFound)
                )
            )
        ),

        // --- KOMPONEN AI CHATBOT ---
        m("div", { class: "fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans" },
          isChatOpen ? m("div", { class: `${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'} border rounded-2xl w-80 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-4 overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out_1]` },
            m("div", { class: "bg-indigo-600 p-4 flex justify-between items-center text-white" },
              m("span", { class: "font-bold flex items-center gap-2" }, "🤖 Teman Konser AI"),
              m("button", { class: "hover:text-slate-300 font-bold", onclick: () => isChatOpen = false }, "✕")
            ),
            m("div", { class: `p-4 h-72 overflow-y-auto flex flex-col gap-3 ${isDark ? 'bg-slate-900/90' : 'bg-slate-50'} text-sm`, id: "chat-box", onupdate: (vnode) => vnode.dom.scrollTop = vnode.dom.scrollHeight },
              chatHistory.map(chat => 
                m("div", { class: `p-3 max-w-[85%] rounded-xl shadow-md ${chat.role === 'ai' ? (isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-800') + ' self-start rounded-tl-none' : 'bg-indigo-500 text-white self-end rounded-tr-none'}` }, 
                  chat.text
                )
              ),
              isAiTyping ? m("div", { class: `${textMuted} italic text-xs ml-2` }, Settings.lang === "id" ? "AI sedang mengetik..." : "AI is typing...") : null
            ),
            m("form", { class: `flex p-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-t`, onsubmit: sendChatMessage },
              m("input", { class: `flex-grow ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'} border rounded-lg p-2 outline-none focus:border-indigo-500 text-sm`, placeholder: Settings.lang === "id" ? "Tanya apa aja..." : "Ask me anything...", value: chatMessage, oninput: e => chatMessage = e.target.value }),
              m("button", { type: "submit", class: "ml-3 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all" }, "➤")
            )
          ) : null,
          m("button", { class: `bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)] text-2xl flex items-center justify-center transform transition-transform hover:scale-110 ${isChatOpen ? 'rotate-180 bg-rose-600 hover:bg-rose-500 shadow-rose-500/50' : ''}`, onclick: () => isChatOpen = !isChatOpen }, 
            isChatOpen ? "✕" : "🤖"
          )
        ),

        // --- FOOTER SOSIAL MEDIA ---
        m("footer", { class: `w-full ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-200'} border-t py-8 mt-12 text-center transition-colors` },
          m("div", { class: "container mx-auto" },
            m("h3", { class: `${textMuted} font-medium mb-4` }, t.connect),
            m("div", { class: "flex justify-center items-center gap-6 mb-6" },
              m("a", { href: "https://www.instagram.com/temankonser.fest", target: "_blank", class: `${isDark ? 'text-slate-300' : 'text-slate-600'} hover:text-indigo-500 font-medium transition-colors` }, "Instagram"),
              m("a", { href: "https://twitter.com/", target: "_blank", class: `${isDark ? 'text-slate-300' : 'text-slate-600'} hover:text-indigo-500 font-medium transition-colors` }, "Twitter"),
              m("a", { href: "https://www.tiktok.com/@temankonser.fest", target: "_blank", class: `${isDark ? 'text-slate-300' : 'text-slate-600'} hover:text-indigo-500 font-medium transition-colors` }, "Tiktok")
            ),
            m("p", { class: `${isDark ? 'text-slate-500' : 'text-slate-400'} text-sm` }, "© 2026 TemanKonser.fest. Created By ragaes-ui.")
          )
        )
      );
    }
  };
};

export default ConcertLayout;
