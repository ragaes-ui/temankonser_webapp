import m from "mithril";
import ConcertState from "../models/ConcertState.js";
import Navbar from "../components/Navbar.js";
import PhotoGrid from "../components/PhotoGrid.js";

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
    oninit: () => {
      previousId = m.route.param("id");
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
      const currentId = m.route.param("id");
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
      const currentId = m.route.param("id");
      const activeConcert = ConcertState.list.find(c => c.id === currentId);

      // KODE BARU: Ditambahkan "flex flex-col" pada div utama agar tata letaknya bisa didorong ke bawah
      return m("div", { class: "min-h-screen flex flex-col bg-slate-900 text-slate-200 font-sans", key: "layout" },
        m(Navbar),
        
        // KODE BARU: Ditambahkan "flex-grow" agar konten utama mengisi ruang kosong dan mendorong footer ke bawah
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
                          
                          // Hook Mithril dengan Sensor Scroll (Intersection Observer)
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
                      m("div", { class: "mt-8 animate-[fadeIn_0.5s_ease-out_1]" },
                        
                        // KODE BARU: Animasi meluncur dari samping (kiri) untuk teks "Arsip Foto"
                        m("h2", { 
                          // Awal Mula: Sembunyi (opacity-0) dan geser ke kiri (-translate-x-12)
                          class: "text-xl font-semibold text-slate-300 mb-6 border-b border-slate-600 inline-block pb-2 opacity-0 -translate-x-12 transition-all duration-700 ease-out",
                          
                          // Perintah untuk memunculkan dan menggeser teks ke posisi normal (translate-x-0)
                          oncreate: (vnode) => {
                            setTimeout(() => {
                              vnode.dom.classList.remove("opacity-0", "-translate-x-12");
                              vnode.dom.classList.add("opacity-100", "translate-x-0");
                            }, 50); // Jeda sangat singkat (50ms) agar animasinya langsung jalan saat diklik
                          }
                        }, "Arsip Foto"),

                        m(PhotoGrid, { images: activeConcert.gallery })
                      )
                  )
                : 
                  m("div", { class: "text-center text-slate-500 mt-20 text-lg" }, "Laman tidak ditemukan.")
                )
            )
        ),

        // --- KODE BARU: FOOTER SOSIAL MEDIA ---
        m("footer", { class: "w-full bg-slate-950/50 border-t border-slate-800 py-8 mt-12 text-center" },
          m("div", { class: "container mx-auto" },
            m("h3", { class: "text-slate-400 font-medium mb-4" }, "Terkoneksi dengan Kami:"),
            
            // Tempat Link Sosial Media
            m("div", { class: "flex justify-center items-center gap-6 mb-6" },
              // Link 1 (Bisa diganti dengan link Instagram)
              m("a", { 
                href: "https://www.instagram.com/temankonser.fest?igsh=MWFkeWJsbTc5dHRkcg%3D%3D", 
                target: "_blank", 
                class: "text-slate-300 hover:text-indigo-400 font-medium transition-colors" 
              }, "Instagram"),
              
              // Link 2 (Bisa diganti dengan link X/Twitter atau komunitas)
              m("a", { 
                href: "https://twitter.com/", 
                target: "_blank", 
                class: "text-slate-300 hover:text-indigo-400 font-medium transition-colors" 
              }, "Twitter"),
              
              // Link 3 (Contoh link website ticketing / eksternal)
              m("a", { 
                href: "https://www.tiktok.com/@temankonser.fest?_r=1&_t=ZS-98GYL88afNo", 
                target: "_blank", 
                class: "text-slate-300 hover:text-indigo-400 font-medium transition-colors" 
              }, "Tiktok")
            ),
            
            // Teks Hak Cipta
            m("p", { class: "text-slate-500 text-sm" }, "© 2026 Teman Konser.fest. Dibuat untuk memori tanpa batas.")
          )
        )
        // --- AKHIR FOOTER ---

      );
    }
  };
};

export default ConcertLayout;