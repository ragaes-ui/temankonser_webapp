import m from "mithril";
import ConcertState from "../models/ConcertState.js";
import Navbar from "../components/Navbar.js";
import PhotoGrid from "../components/PhotoGrid.js";

// --- FUNGSI PENGUBAH LINK VIDEO GOOGLE DRIVE (TAMBAHAN BARU) ---
const formatVideoEmbed = (url) => {
  if (!url) return "";
  // Melacak dan mengambil ID unik dari link Google Drive
  const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/);
  // Merakit ulang link menjadi format /preview yang diizinkan untuk iframe
  if (match && match[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url; 
};
// ----------------------------------------------------------------

const ConcertLayout = () => {
  let isLoading = false;
  let previousId = null;
  let isOpen = false;
  
  // --- STATE UNTUK ANIMASI KETIK (TYPEWRITER) ---
  const words = ["Teman Konser Festival", "Ruang Arsip Digital", "Memori Area Moshpit"];
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

  // KATA "RETURN {" INI SANGAT PENTING DAN TIDAK BOLEH HILANG
  return {
    oninit: async () => {
      // 1. Tarik data dari Database saat web pertama kali dibuka
      if (ConcertState.list.length === 0) {
        // Kode ini akan menahan proses sampai data benar-benar selesai ditarik!
        await ConcertState.loadConcerts();
      }

      previousId = m.route.param("id") || "home";
      ConcertState.setConcert(previousId);

      // --- TUTUP SPLASH SCREEN SETELAH DATA DATABASE BERHASIL DIMUAT ---
      const loader = document.getElementById("global-loader");
      if (loader) {
        loader.style.opacity = "0"; // Memudar perlahan
        setTimeout(() => {
          loader.remove(); // Dihapus dari HTML
        }, 700);
      }

      // Animasi transisi internal Mithril
      isLoading = true;
      setTimeout(() => {
        isLoading = false;
        m.redraw();
      }, 400);
      
      runTypewriter(); 
    },

    onremove: () => {
      if (typeTimer) clearTimeout(typeTimer); 
    },

    onupdate: () => {
      const currentId = m.route.param("id") || "home";
      
      // Selalu update state konser yang aktif setiap pindah halaman
      ConcertState.setConcert(currentId);

      if (currentId !== previousId) {
        previousId = currentId;
        isOpen = false; 
        isLoading = true;
        m.redraw();
        
        setTimeout(() => {
          isLoading = false;
          m.redraw();
        }, 400); 
      }
    },

view: () => {
      const rawParam = m.route.param("id") || "home";
      const currentId = decodeURIComponent(rawParam).toLowerCase().trim();

      // Pencarian super fleksibel: Cek id, _id, shortTitle, maupun title
      const activeConcert = ConcertState.list?.find(c => {
        const cId = String(c.id || c._id || "").toLowerCase().trim();
        const cShort = String(c.shortTitle || "").toLowerCase().trim();
        const cTitle = String(c.title || "").toLowerCase().trim();

        return (
          cId === currentId ||
          cShort === currentId ||
          cTitle === currentId ||
          // Cek juga jika ada perbedaan spasi / tanda hubung (misal: "dokumentasi-olahraga" vs "dokumentasi olahraga")
          cId.replace(/-/g, " ") === currentId.replace(/-/g, " ") ||
          cShort.replace(/-/g, " ") === currentId.replace(/-/g, " ") ||
          cTitle.replace(/-/g, " ") === currentId.replace(/-/g, " ")
        );
      });

      // Mengecek apakah konser ini punya data video
      const hasVideos = activeConcert && activeConcert.videos && activeConcert.videos.length > 0;

      return m("div", { class: "min-h-screen flex flex-col bg-slate-900 text-slate-200 font-sans", key: "layout" },
        m(Navbar),
        
        m("main", { class: "container mx-auto p-4 md:p-8 flex-grow" },
          
          isLoading ? 
            m("div", { class: "flex flex-col items-center justify-center mt-32 animate-[pulse_0.5s_ease-out_infinite]" },
              m("div", { class: "w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-4 shadow-lg" }),
              m("p", { class: "text-slate-400 font-medium tracking-widest" }, "MEMUAT...")
            )
          :
            m("div", { class: "animate-[fadeIn_0.3s_ease-out_1]" },
              currentId === "home" ? 
                
                // --- HALAMAN BERANDA ---
                m("div", { class: "flex flex-col gap-20 mt-12 pb-16 items-center text-center" },
                  m("div", { class: "max-w-3xl mx-auto flex flex-col items-center gap-6" },
                    m("img", {
                      src: "/temankonserlogo.png",
                      alt: "Logo Teman Konser",
                      class: "w-32 h-32 md:w-48 md:h-48 object-contain mx-auto drop-shadow-xl mb-2"
                    }),
                    m("h1", { class: "text-4xl md:text-5xl font-bold text-white tracking-tight min-h-[3rem] md:min-h-[4rem] flex items-center justify-center" }, 
                      currentText,
                      m("span", { class: "text-indigo-500 animate-pulse font-light ml-1" }, "|") 
                    ),
                    m("p", { class: "text-lg text-slate-400 leading-relaxed" }, 
                      "Selamat datang di ruang arsip digital kita. Web ini dibuat khusus untuk mengabadikan setiap momen dan euforia yang kita rasakan bersama di area moshpit maupun tribun."
                    ),
                    m("div", { class: "w-16 h-1 bg-slate-700 rounded-full my-2" }),
                    m("p", { class: "text-md text-slate-500" }, 
                      "Silakan klik menu di atas untuk berpindah ke laman dokumentasi."
                    )
                  ),

                  m("div", { class: "w-full max-w-4xl mx-auto" },
                    m("h2", { class: "text-2xl font-semibold text-white mb-8" }, "Highlight Perjalanan"),
                    m("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                      [
                        { title: "Total Gigs", value: "15+", desc: "Konser & Festival" },
                        { title: "Koleksi", value: "300+", desc: "Foto & Video Memori" },
                        { title: "Solidaritas", value: "100%", desc: "Selalu Sing-along" }
                      ].map((stat, index) => 
                        m("div", { 
                          class: "bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-700 ease-out transform translate-y-12 opacity-0 hover:bg-slate-800/70 hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:-translate-y-2 cursor-default",
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
                          m("h3", { class: "text-4xl font-bold text-indigo-400 mb-2" }, stat.value),
                          m("p", { class: "text-slate-300 font-medium text-lg" }, stat.title),
                          m("p", { class: "text-slate-500 text-sm mt-2" }, stat.desc)
                        )
                      )
                    )
                  )
                )

              : 
                
                // --- HALAMAN DOKUMENTASI ---
                (activeConcert ? 
                  m("div", { class: "bg-slate-800/40 rounded-xl border border-slate-700 p-8 mb-10 text-center max-w-5xl mx-auto mt-4 shadow-xl" },
                    m("h1", { class: "text-3xl md:text-4xl font-bold mb-4 text-white" }, activeConcert.title),
                    m("p", { class: "text-slate-400 italic mb-8" }, `"${activeConcert.desc}"`),
                    
                    !isOpen ? 
                      m("button", {
                        class: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-md transform transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg",
                        onclick: () => { isOpen = true; }
                      }, "Buka Dokumentasi")
                    : 
                      m("div", { class: "mt-12 animate-[fadeIn_0.5s_ease-out_1]" },
                        
                        // GRID 2 KOLOM: Kiri untuk Foto, Kanan untuk Video (Bersebelahan)
                        m("div", { class: "grid grid-cols-1 lg:grid-cols-2 gap-10 items-start text-left" },
                          
                          // --- KOLOM KIRI: ARSIP FOTO ---
                          m("div", { class: "w-full" },
                            m("div", { class: "flex items-center gap-3 mb-6 border-b border-slate-700 pb-3" },
                              m("span", { class: "text-2xl" }, "📷"),
                              m("h3", { class: "text-2xl font-bold text-slate-200" }, "Arsip Foto")
                            ),
                            m("div", { class: "bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner" },
                              m(PhotoGrid, { images: activeConcert.gallery })
                            )
                          ),

                          // --- KOLOM KANAN: ARSIP VIDEO ---
                          hasVideos ? 
                            m("div", { class: "w-full" },
                              m("div", { class: "flex items-center gap-3 mb-6 border-b border-slate-700 pb-3" },
                                m("span", { class: "text-2xl" }, "🎥"),
                                m("h3", { class: "text-2xl font-bold text-slate-200" }, "Arsip Video")
                              ),
                              m("div", { class: "grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner" },
                                (activeConcert.videos || []).map((vidUrl, index) => 
                                  m("div", { 
                                    class: "w-full bg-black/80 p-2 rounded-xl shadow-lg border border-slate-700 opacity-0 transform translate-y-12 transition-all duration-1000 ease-out",
                                    oncreate: (vnode) => {
                                      const observer = new IntersectionObserver((entries) => {
                                        if (entries[0].isIntersecting) {
                                          setTimeout(() => {
                                            vnode.dom.classList.remove("opacity-0", "translate-y-12");
                                            vnode.dom.classList.add("opacity-100", "translate-y-0");
                                          }, index * 200); 
                                          observer.unobserve(vnode.dom);
                                        }
                                      }, { threshold: 0.1 });
                                      observer.observe(vnode.dom);
                                    }
                                  },
                                    vidUrl.includes("drive.google.com") ? 
                                      // --- PERUBAHAN IFRAME DI SINI ---
                                      m("iframe", {
                                        src: formatVideoEmbed(vidUrl), // Fungsi diterapkan
                                        class: "w-full h-[400px] md:h-[500px] rounded-xl border-0", 
                                        allowfullscreen: true,
                                        loading: "lazy",
                                        sandbox: "allow-scripts allow-same-origin allow-popups" // Sandbox diterapkan
                                      })
                                      // ---------------------------------
                                    : 
                                      m("video", {
                                        src: vidUrl,
                                        class: "w-full h-[400px] md:h-[500px] object-contain rounded-xl bg-black shadow-inner", 
                                        controls: true,
                                        preload: "metadata"
                                      })
                                  )
                                )
                              )
                            ) 
                          : 
                            // Jika tidak ada video, tampilkan pesan kosong di sebelah kanan
                            m("div", { class: "w-full flex flex-col items-center justify-center bg-slate-900/30 p-10 rounded-2xl border border-slate-700/50 border-dashed" },
                              m("span", { class: "text-4xl mb-3 opacity-50" }, "🎥"),
                              m("p", { class: "text-slate-500 italic" }, "Belum ada arsip video untuk dokumentasi event ini.")
                            )
                        )
                      )
                  )
                : 
                  m("div", { class: "text-center text-slate-500 mt-20 text-lg" }, "Laman tidak ditemukan.")
                )
            )
        ),

        // --- FOOTER SOSIAL MEDIA ---
        m("footer", { class: "w-full bg-slate-950/50 border-t border-slate-800 py-8 mt-12 text-center" },
          m("div", { class: "container mx-auto" },
            m("h3", { class: "text-slate-400 font-medium mb-4" }, "Terkoneksi dengan Kami:"),
            
            m("div", { class: "flex justify-center items-center gap-6 mb-6" },
              m("a", { 
                href: "https://www.instagram.com/temankonser.fest?igsh=MWFkeWJsbTc5dHRkcg%3D%3D", 
                target: "_blank", 
                class: "text-slate-300 hover:text-indigo-400 font-medium transition-colors" 
              }, "Instagram"),
              
              m("a", { 
                href: "https://twitter.com/", 
                target: "_blank", 
                class: "text-slate-300 hover:text-indigo-400 font-medium transition-colors" 
              }, "Twitter"),
              
              m("a", { 
                href: "https://www.tiktok.com/@temankonser.fest?_r=1&_t=ZS-98GYL88afNo", 
                target: "_blank", 
                class: "text-slate-300 hover:text-indigo-400 font-medium transition-colors" 
              }, "Tiktok")
            ),
            
            m("p", { class: "text-slate-500 text-sm" }, "© 2026 TemanKonser.fest. Created By ragaes-ui.")
          )
        )
      );
    }
  };
};

export default ConcertLayout;
