// src/models/ConcertState.js

// --- KODE BARU: Trik Anti-Blokir Google Drive ---
export const formatDriveLink = (url) => {
  if (!url) return "";
  
  // Mencari ID unik dari link Google Drive mas
  const match = url.match(/\/d\/(.*?)\//) || url.match(/id=(.*?)(&|$)/);
  
  if (match && match[1]) {
    const imageId = match[1];
    // Menggunakan server lh3 googleusercontent yang lebih longgar soal keamanan hotlinking
    return `https://lh3.googleusercontent.com/d/${imageId}`;
  }
  
  return url;
};

const ConcertState = {
  list: [
    { 
      id: "pbb-bogor", 
      shortTitle: "PBB Bogor 2026", // <-- NAMA PENDEK UNTUK NAVBAR
      title: "Pesta Bebas Berselancar (Stadion Pakansari Bogor)", // <-- NAMA PANJANG UNTUK HALAMAN
      desc: "Seru-seruan di Pakansari, pecah banget!", 
      gallery: [ 
        "https://drive.google.com/file/d/1h1mWu0GKZqAK5Dt4FY-On5MJBtBnzT-l/view?usp=sharing",
        "https://drive.google.com/file/d/1oGkcpsapkvUJGXFNd6zll6okm4SVUpGN/view?usp=sharing",
        "https://drive.google.com/file/d/1EBpyzfRK-3cHQP8njTr0kiEyUu6e0Pw_/view?usp=sharing",
        "https://drive.google.com/file/d/1FA947VHP-x8SE_syDgPbagdmF6dQhp2v/view?usp=sharing",
        "https://drive.google.com/file/d/1K2xcdX1b5D1CJkpXU78NqNMWh-jYSLno/view?usp=sharing",
        "https://drive.google.com/file/d/1I0KNQXGoWBBVgE0Ut0mT6TEd4pxeGz3Q/view?usp=sharing",
        "https://drive.google.com/file/d/1dgQF-p-YPoSDo0s-Mt0sPlqBu8KRpgkg/view?usp=sharing",
        "https://drive.google.com/file/d/1zJMTznISz5DQOFqyvZRr0tHGMpFLEyht/view?usp=sharing",
        "https://drive.google.com/file/d/18gTOjIuNq1P5CzjDu9Pm1BYCYRmlDkPl/view?usp=sharing",
        "https://drive.google.com/file/d/1FzbNlYFCciEdpFW0oHpGNa8cSEIgrWfb/view?usp=sharing",
        "https://drive.google.com/file/d/1gRy7GLAGrohAiL066dYIVlREJHGF9ZzK/view?usp=sharing",
        "https://drive.google.com/file/d/11mbO6nr2UkDfnY9JeIuqddTyFjTFiasn/view?usp=sharing",
        "https://drive.google.com/file/d/1vrs4nJrZuACOMJBArV-RvlO5V1HhmZm_/view?usp=sharing"
      ] 
      
    },
        {
      id: "Comafest",
      shortTitle: "Comafest 2026",
      title: "ComaFest Plaza Parkir Timur GBK",
      desc: "Seru Seruan Bareng di comefest, singalong bareng bareng dan surving seru seruan.",
      gallery: [ 
        "https://drive.google.com/file/d/1N9MUmpczRcjhCLVUTK9gN8EKyiMEkm4X/view?usp=sharing",
        "https://drive.google.com/file/d/1v5BawG6lllBUP-9TrFNqk1x1clQjTOjD/view?usp=sharing",
        "https://drive.google.com/file/d/10flE_JsshTyiEhPVBQdjMo9DM1GAVkv8/view?usp=sharing",
        "https://drive.google.com/file/d/1vXDrp5iUqbTMM6iSXqa4T8NlOeARYZgX/view?usp=sharing"
      ]
    },
    { 
      id: "Mantra In Summer", 
      shortTitle: "Mantra In Summer 26", 
      title: "Mantra in summer", 
      desc: "Tiga hari capek tapi seru banget keliling panggung dan moshpit.", 
      gallery: [ 
        "https://drive.google.com/file/d/id_drive/view?usp=sharing", 
      ] 

    },
    {
      id: "foto-nongkrong",
      shortTitle: "Nongkrong",
      title: "Foto Nongkrong",
      desc: "Kumpulan memori ngopi, diskusi, dan kumpul-kumpul santai bareng anak-anak.",
      gallery: [ 
        "https://drive.google.com/file/d/1utYNwtmuRfZLPU6eTXbqtDrC6WXdl6ST/view?usp=sharing",
        "https://drive.google.com/file/d/1UtMvdxXo6WAJw44AYn8BvghwKhnhpmKW/view?usp=sharing",
        "https://drive.google.com/file/d/15Yl5vwL5yR5ldM--3qbQMoxARAP757pX/view?usp=sharing",
        "https://drive.google.com/file/d/13NE0wOy4y_T6CCuP5QtDZ8IxLkwBxNYj/view?usp=sharing",
        "https://drive.google.com/file/d/1aEQxbK422lewqnOY-G5RfwA1g7iojhoI/view?usp=sharing",
        "https://drive.google.com/file/d/1bixk8wJzNhIOSuHLctM0D2777TV3sDIj/view?usp=sharing",
        "https://drive.google.com/file/d/1U77IOxR9HVDukalvABfVUkTC8rHkCQSd/view?usp=sharing",
        "https://drive.google.com/file/d/1Qr7vl3f6mf-8ajD7k1ih0mJje4t0LFuh/view?usp=sharing",
        "https://drive.google.com/file/d/14PgBGTRDolQuaX3sFXahv3HsNue_XMS0/view?usp=sharing",
        "https://drive.google.com/file/d/12BdfLl5afo0D_XakloWHIZ-upziSHXvK/view?usp=sharing",
        "https://drive.google.com/file/d/1ouH9bY2UWOHfcsxn4egG6JZfGFeWGXDr/view?usp=sharing",
        "https://drive.google.com/file/d/1sNA_R2jX42mckK6Tq2H-yzYPdxSQNbqH/view?usp=sharing",
        "https://drive.google.com/file/d/180bXrHOlca51_kQXQY8bednHelX71Uqm/view?usp=sharing",
        "https://drive.google.com/file/d/1IjvD83lwqsu9qBW4BNdfkANvUcR6uJbN/view?usp=sharing",
        "https://drive.google.com/file/d/1GaprohF3MBFo75doRYdk9HttXkGnGYIp/view?usp=sharing",
        "https://drive.google.com/file/d/1ZcMdO8bMv4UTss90_a10aSe9MSu-pV5K/view?usp=sharing",
        "https://drive.google.com/file/d/19KumiGwb5aSD5QCZJylTBUQfmAWBm3TP/view?usp=sharing",
        "https://drive.google.com/file/d/1oXkiwlke7nT8yNwSpT_ty8FdnXvupWGB/view?usp=sharing",
        "https://drive.google.com/file/d/1aZ5p1G2HEy4rvLW4f46QGXVBKdAYkH-p/view?usp=sharing",
        "https://drive.google.com/file/d/1KKCkZkjncM-zxUv7osdXbMjL76maSSut/view?usp=sharing",
        "https://drive.google.com/file/d/1byB6wWkfGKT2H6v_IXSFcXpy3zPcctnS/view?usp=sharing",
        "https://drive.google.com/file/d/1ZaA-6QYXujZ0s6mBPmZaCkrfi-p8o101/view?usp=sharing",
        "https://drive.google.com/file/d/1cDMu1uj57XmCtKjDt738Z8mtdI5x5Mwo/view?usp=sharing"

      ]
    }
  ],
  
  
  currentId: "home",
  
  setConcert: (id) => {
    ConcertState.currentId = id;
  }
};

export default ConcertState;