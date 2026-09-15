import m from "mithril";
import ConcertState from "../models/ConcertState.js";
import Navbar from "../components/Navbar.js";
import PhotoGrid from "../components/PhotoGrid.js";
import Settings from "../models/Settings.js"; 

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
  let animatedStats = {}; 
  
  let isChatOpen = false;
  let chatMessage = "";
  let isAiTyping = false;
  let chatHistory = [{ role: "ai", text: "Halo bro! Gue asisten AI Teman Konser. Ada yang pengen ditanyain seputar web ini?" }];

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
      const res = await m.request({ method: "POST", url: `${alamatServer}/tanya`, body: { pesan: userText } });
      chatHistory.push({ role: "ai", text: res.reply });
    } catch (error) {
      chatHistory.push({ role: "ai", text: Settings.lang === "id" ? "Duh, koneksi ke otak AI gue lagi gangguan nih." : "Oops, my AI brain connection is down." });
    } finally {
      isAiTyping = false;
    }
  };

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
      
      // --- KREASI WARNA BARU YANG JAUH LEBIH ELEGAN ---
      const isDark = Settings.theme === "dark";
      
      // Latar belakang gradient berlapis (tidak mati seperti pure black)
      const bgRoot = isDark 
        ? "bg-gradient-to-b from-slate-900 via-[#0a0f1c] to-black text-slate-200" 
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800";
      
      const textHeading = isDark ? "text-white drop-shadow-md" : "text-slate-900";
      const textMuted = isDark ? "text-slate-400" : "text-slate-500";
      
      // Kartu dengan efek Kaca (Glass) dan Glow tipis
      const bgCard = isDark 
        ? "bg-slate-800/40 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]" 
        : "bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-xl";
      
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

      return m("div", { class: `min-h-screen flex flex-col ${bgRoot} font-sans transition-colors duration-500`, key: "layout" },
        m(Navbar),
        
        m("main", { class: "container mx-auto p-4 md:p-8 flex-grow" },
          isLoading ? 
            m("div", { class: "flex flex-col items-center justify-center mt-32 animate-[pulse_0.5s_ease-out_infinite]" },
              m("div", { class: `w-12 h-12 border-4 ${isDark ? 'border-slate-800' : 'border-slate-300'} border-t-indigo-500 rounded-full animate-spin mb-4 shadow-lg` }),
              m("p", { class: `${textMuted} font-medium tracking-widest` }, Settings.lang === "id" ? "MEMUAT..." : "LOADING...")
            )
          :
            m("div", { class: "animate-[fadeIn_0.5s_ease-out_1]" },
              currentId === "home" ? 
                
                m("div", { class: "flex flex-col gap-20 mt-12 pb-16 items-center text-center" },
                  m("div", { class: "max-w-3xl mx-auto flex flex-col items-center gap-6 relative" },
                    // Ornamen cahaya redup di belakang logo (Ambient Glow)
                    isDark ? m("div", { class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" }) : null,
                    
                    m("img", { src: "/temankonserlogo.png", alt: "Logo", class: "w-32 h-32 md:w-48 md:h-48 object-contain mx-auto drop-shadow-2xl mb-2 relative z-10" }),
                    
                    m("h1", { class: `text-4xl md:text-5xl font-bold ${textHeading} tracking-tight min-h-[3rem] md:min-h-[4rem] flex items-center justify-center relative z-10` }, 
                      currentText,
                      m("span", { class: "text-indigo-500 animate-pulse font-light ml-1" }, "|") 
                    ),
                    m("p", { class: `text-lg ${textMuted} leading-relaxed max-w-2xl` }, t.welcome),
                    m("div", { class: `w-16 h-1 ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-200'} rounded-full my-2` }),
                    m("p", { class: `text-md ${isDark ? 'text-slate-500' : 'text-slate-500'}` }, t.hint)
                  ),

                  m("div", { class: "w-full max-w-4xl mx-auto relative z-10" },
                    m("h2", { class: `text-2xl font-bold ${textHeading} mb-10 tracking-wide` }, t.highlight),
                    m("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                      t.stats.map((stat, index) => 
                        m("div", { 
                          class: `${bgCard} border rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-700 ease-out transform ${
                            animatedStats[index] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                          }`,
                          oncreate: (vnode) => {
                            if (animatedStats[index]) return; 
                            const observer = new IntersectionObserver((entries) => {
                              if (entries[0].isIntersecting) {
                                setTimeout(() => {
                                  animatedStats[index] = true;
                                  m.redraw(); 
                                }, index * 200 + 100); 
                                observer.unobserve(vnode.dom);
                              }
                            }, { threshold: 0.2 });
                            observer.observe(vnode.dom);
                          }
                        },
                          m("h3", { class: "text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-2 drop-shadow-sm" }, stat.v),
                          m("p", { class: `font-semibold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}` }, stat.t),
                          m("p", { class: `text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}` }, stat.d)
                        )
                      )
                    )
                  )
                )

              : 
                
                (activeConcert ? 
                  m("div", { class: `${isDark ? 'bg-slate-900/60 backdrop-blur-md border-slate-700/50' : 'bg-white/80 backdrop-blur-md border-slate-200'} rounded-2xl border p-8 md:p-12 mb-10 text-center max-w-5xl mx-auto mt-4 shadow-2xl transition-colors` },
                    m("h1", { class: `text-3xl md:text-5xl font-extrabold mb-6 ${textHeading}` }, activeConcert.title),
                    m("p", { class: `italic mb-10 text-lg ${textMuted} max-w-3xl mx-auto` }, `"${activeConcert.desc}"`),
                    
                    !isOpen ? 
                      m("button", {
                        class: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-10 rounded-full transform transition-all duration-300 hover:scale-105 shadow-[0_10px_20px_rgba(99,102,241,0.3)]",
                        onclick: () => { isOpen = true; }
                      }, t.openDoc)
                    : 
                      m("div", { class: "mt-16 animate-[fadeIn_0.5s_ease-out_1]" },
                        m("div", { class: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-start text-left" },
                          
                          m("div", { class: "w-full" },
                            m("div", { class: `flex items-center gap-4 mb-6 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'} pb-4` },
                              m("span", { class: "text-3xl" }, "📷"),
                              m("h3", { class: `text-2xl font-bold ${textHeading}` }, t.photoArc)
                            ),
                            m("div", { class: `${isDark ? 'bg-slate-950/50 border-slate-800/50' : 'bg-slate-50 border-slate-200'} p-5 rounded-3xl border shadow-inner` },
                              m(PhotoGrid, { images: activeConcert.gallery })
                            )
                          ),

                          hasVideos ? 
                            m("div", { class: "w-full" },
                              m("div", { class: `flex items-center gap-4 mb-6 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'} pb-4` },
                                m("span", { class: "text-3xl" }, "🎥"),
                                m("h3", { class: `text-2xl font-bold ${textHeading}` }, t.videoArc)
                              ),
                              m("div", { class: `grid grid-cols-1 sm:grid-cols-2 gap-5 ${isDark ? 'bg-slate-950/50 border-slate-800/50' : 'bg-slate-50 border-slate-200'} p-5 rounded-3xl border shadow-inner` },
                                (activeConcert.videos || []).map((vidUrl, index) => 
                                  m("div", { class: `w-full ${isDark ? 'bg-black' : 'bg-slate-900'} p-2.5 rounded-2xl shadow-xl border border-slate-800 animate-[fadeIn_0.5s_ease-out_1]` },
                                    vidUrl.includes("drive.google.com") ? 
                                      m("iframe", { src: formatVideoEmbed(vidUrl), class: "w-full h-[250px] md:h-[350px] rounded-xl border-0", allowfullscreen: true, loading: "lazy", sandbox: "allow-scripts allow-same-origin allow-popups" })
                                    : 
                                      m("video", { src: vidUrl, class: "w-full h-[250px] md:h-[350px] object-contain rounded-xl bg-black", controls: true })
                                  )
                                )
                              )
                            ) 
                          : 
                            m("div", { class: `w-full flex flex-col items-center justify-center ${isDark ? 'bg-slate-900/30 border-slate-700/30' : 'bg-slate-50 border-slate-200'} p-12 rounded-3xl border-2 border-dashed` },
                              m("span", { class: "text-5xl mb-4 opacity-40 grayscale" }, "🎥"),
                              m("p", { class: `${isDark ? 'text-slate-500' : 'text-slate-400'} italic text-center font-medium` }, t.noVideo)
                            )
                        )
                      )
                  )
                : 
                  m("div", { class: `text-center ${textMuted} mt-24 text-xl font-medium` }, t.notFound)
                )
            )
        ),

        // --- KOMPONEN AI CHATBOT ---
        m("div", { class: "fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans" },
          isChatOpen ? m("div", { class: `${isDark ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50' : 'bg-white/95 backdrop-blur-xl border-slate-200'} border rounded-3xl w-[340px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-4 overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out_1]` },
            m("div", { class: "bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white" },
              m("span", { class: "font-bold flex items-center gap-2 text-md" }, "🤖 Teman Konser AI"),
              m("button", { class: "hover:text-indigo-200 font-bold text-lg", onclick: () => isChatOpen = false }, "✕")
            ),
            m("div", { class: `p-5 h-80 overflow-y-auto flex flex-col gap-4 ${isDark ? 'bg-transparent' : 'bg-slate-50/50'} text-sm`, id: "chat-box", onupdate: (vnode) => vnode.dom.scrollTop = vnode.dom.scrollHeight },
              chatHistory.map(chat => 
                m("div", { class: `p-3.5 max-w-[85%] rounded-2xl shadow-sm leading-relaxed ${chat.role === 'ai' ? (isDark ? 'bg-slate-800 text-slate-200' : 'bg-white border border-slate-100 text-slate-800') + ' self-start rounded-tl-none' : 'bg-indigo-500 text-white self-end rounded-tr-none'}` }, 
                  chat.text
                )
              ),
              isAiTyping ? m("div", { class: `${textMuted} italic text-xs ml-2 flex gap-1` }, m("span", {class: "animate-bounce"}, "•"), m("span", {class: "animate-bounce delay-75"}, "•"), m("span", {class: "animate-bounce delay-150"}, "•")) : null
            ),
            m("form", { class: `flex p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-t`, onsubmit: sendChatMessage },
              m("input", { class: `flex-grow ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'} border rounded-xl p-3 outline-none focus:border-indigo-500 text-sm transition-colors`, placeholder: Settings.lang === "id" ? "Tanya apa aja..." : "Ask me anything...", value: chatMessage, oninput: e => chatMessage = e.target.value }),
              m("button", { type: "submit", class: "ml-3 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all" }, "➤")
            )
          ) : null,
          m("button", { class: `bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-14 h-14 rounded-full shadow-[0_10px_25px_rgba(99,102,241,0.5)] text-2xl flex items-center justify-center transform transition-transform duration-300 hover:scale-110 ${isChatOpen ? 'rotate-180 from-rose-500 to-pink-600 shadow-rose-500/40' : ''}`, onclick: () => isChatOpen = !isChatOpen }, 
            isChatOpen ? "✕" : "🤖"
          )
        ),

        // --- FOOTER SOSIAL MEDIA ---
        m("footer", { class: `w-full ${isDark ? 'bg-black/40 border-slate-800/50' : 'bg-white border-slate-200'} border-t py-10 mt-16 text-center transition-colors` },
          m("div", { class: "container mx-auto" },
            m("h3", { class: `${textMuted} font-semibold mb-6 tracking-wide text-sm uppercase` }, t.connect),
            m("div", { class: "flex justify-center items-center gap-8 mb-8" },
              m("a", { href: "https://www.instagram.com/temankonser.fest", target: "_blank", class: `${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'} font-medium transition-colors flex items-center gap-2` }, "Instagram"),
              m("a", { href: "https://twitter.com/", target: "_blank", class: `${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'} font-medium transition-colors flex items-center gap-2` }, "Twitter"),
              m("a", { href: "https://www.tiktok.com/@temankonser.fest", target: "_blank", class: `${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'} font-medium transition-colors flex items-center gap-2` }, "Tiktok")
            ),
            m("p", { class: `${isDark ? 'text-slate-600' : 'text-slate-400'} text-xs font-medium tracking-wide` }, "© 2026 TemanKonser.fest. Created By ragaes-ui.")
          )
        )
      );
    }
  };
};

export default ConcertLayout;
