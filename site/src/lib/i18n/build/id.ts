// Bahasa Indonesia: pertanyaan benchmark dan prompt untuk ditempel ke agent (lihat server/localize.ts).
// Kosakata mengikuti dict/id.ts: agent, tool, token.
import type { BuildCopy } from '#lib/server/localize.ts';

const copy: BuildCopy = {
	questions: {
		'docs-config-path': 'Variabel lingkungan apa yang membuat Orbit membaca file konfigurasinya dari path lain?',
		'docs-deploy-strategies': 'Strategi rollout apa saja yang bisa saya pilih saat menjalankan orbit deploy?',
		'docs-deploy-timeout': 'Berapa timeout default `orbit deploy`, dan flag apa yang mengubahnya?',
		'docs-exit-code': 'Langkah CI saya gagal dengan exit code orbit 4. Apa artinya?',
		'docs-retained-releases': 'Secara default, berapa banyak rilis sebelumnya yang disimpan Orbit untuk rollback?',
		'live-cloudflare-d1-database-size':
			'Saya pakai paket Workers Paid. Seberapa besar satu database Cloudflare D1 bisa tumbuh?',
		'live-cloudflare-kv-key-size':
			'Seberapa panjang key di Cloudflare Workers KV? Saya ingin tahu ukuran maksimum key.',
		'live-cloudflare-kv-value-size': 'Berapa ukuran maksimum satu value yang disimpan di Cloudflare Workers KV?',
		'live-cloudflare-queues-message-size':
			'Berapa ukuran pesan terbesar yang bisa saya kirim ke Cloudflare Queue? Saya butuh batas ukuran per pesan.',
		'live-cloudflare-workers-free-requests':
			'Berapa request per hari yang bisa ditangani Workers saya di paket Workers Free Cloudflare sebelum kena batas?',
		'live-notion-page-size':
			'Saya sedang mempaginasi hasil dari Notion API. Berapa page_size terbesar yang bisa saya minta per panggilan di endpoint list?',
		'live-notion-rate-limit-code':
			'Saat integrasi Notion saya mengirim terlalu banyak request, string kode error apa yang ditaruh API di body respons?',
		'live-notion-request-limit':
			'Berapa request per menit yang diizinkan Notion API per koneksi di paket selain Business dan Enterprise?',
		'live-notion-rich-text-limit':
			'Saya menulis paragraf panjang ke halaman Notion lewat API. Berapa jumlah karakter maksimum untuk isi teks satu objek rich text dalam satu request?',
		'live-notion-upload-size':
			'Berapa ukuran file terbesar yang bisa saya kirim ke Notion API dalam upload single-part sebelum harus beralih ke upload multi-part?',
		'live-spec-contrast':
			'Rasio kontras minimum berapa yang diwajibkan spesifikasi situs ini untuk teks isi berukuran normal?',
		'live-spec-hsts': 'Menurut spesifikasi ini, max-age berapa yang harus saya pasang di header HSTS untuk produksi?',
		'live-spec-inp': 'Nilai INP berapa yang ditetapkan spesifikasi ini sebagai target responsivitas yang baik?',
		'live-spec-meta-description': 'Menurut spesifikasi ini, seberapa panjang meta description sebuah halaman?',
		'live-spec-touch-target':
			'Berapa ukuran minimum area sentuh yang diwajibkan spesifikasi ini untuk tombol dan kontrol interaktif lain?',
		'live-woo-apparel-count': 'Berapa banyak produk di kategori Apparel toko ini, dan apa saja?',
		'live-woo-cheapest-in-stock': 'Produk termurah apa di toko ini yang stoknya ada, dan berapa harganya?',
		'live-woo-notebook-stock': 'Saya mau beli beberapa Agent Notebooks untuk tim saya. Stoknya tinggal berapa?',
		'live-woo-on-sale': 'Ada barang yang sedang diskon di toko ini sekarang? Berapa harga diskonnya?',
		'live-woo-out-of-stock': 'Produk mana di toko ini yang stoknya habis?',
		'store-cart-total':
			'Masukkan satu Stoneware Teapot dan satu Speckled Bowl ke keranjang saya, lalu beri tahu total keranjangnya.',
		'store-cheapest-blue-mug': 'Masukkan dua mug biru termurah ke keranjang saya.',
		'store-green-gift': 'Saya butuh hadiah berwarna hijau di bawah $30 yang bisa dibeli sekarang. Ada apa saja?',
		'store-priciest-teapot': 'Masukkan teko termahal yang kalian jual ke keranjang saya.',
		'store-restock-date':
			'Kapan Ash Glaze Vase tersedia lagi? Sebutkan tanggalnya persis seperti yang ditulis toko.'
	},
	prompts: {
		mcp: 'Gunakan WebMCP lebih dulu di setiap halaman web yang kamu tangani, sebelum membaca atau mengeklik apa pun: di browser kamu sendiri dan di setiap script yang kamu tulis atau jalankan (Playwright, Selenium, Puppeteer, browser-use, CDP), bahkan jika kamu sudah mendukung WebMCP secara native. Siapkan dengan webmcpx (baca https://webmcpx.dev/llms.txt) dan tambahkan aturan ini ke instruksi agent kamu (AGENTS.md, CLAUDE.md, atau yang setara) agar berlaku untuk setiap tugas berikutnya. Lalu buktikan bahwa ini berjalan: buka https://webmcpx.dev, tampilkan daftar tool WebMCP-nya, dan panggil salah satunya.',
		agent: 'Tambahkan WebMCP ke situs ini dengan webmcpx: jalankan `npx skills add webmcpx/webmcpx -y`, ikuti skill-nya, lalu periksa tool-nya dengan `npx webmcpx tools <local URL>`.',
		own: 'Baca https://webmcpx.dev/llms.txt, lalu pelajari proyek ini dan sarankan tool WebMCP yang berguna bagi agent AI di sini. Tanyakan mana yang ingin saya tambahkan, lalu tambahkan dengan webmcpx.'
	}
};

export default copy;
