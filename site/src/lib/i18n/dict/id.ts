// Bahasa Indonesia. Transcreated from en.ts (same keys, same placeholders). Indonesian has a single plural
// category for Intl.PluralRules('id-ID'), so every plural gives only `other`.

import type { Messages } from './en.ts';

const id: Messages = {
	layout: {
		skip: 'Langsung ke konten',
		suggest: {
			text: 'Situs ini ada dalam bahasa Indonesia.',
			action: 'Baca versi Indonesia',
			dismiss: 'Tutup'
		}
	},

	meta: {
		home: {
			title: 'webmcpx: apakah situs Anda sudah siap agent?',
			description:
				'Scan situs mana pun untuk menemukan tool WebMCP. Satu tag script membuatnya siap agent. Benchmark yang bisa direproduksi, open source.'
		},
		brand: {
			title: 'Merek dan sistem desain · webmcpx',
			description:
				'Panduan merek dan sistem desain webmcpx: logo, warna, tipografi, komponen, dan penggunaan merek dagang.'
		},
		benchmark: {
			title: 'Benchmark webmcpx: {model}',
			description: 'Dengan dan tanpa WebMCP di {model}: token, waktu, langkah, dan biaya per pertanyaan.'
		}
	},

	header: {
		nav: 'Utama',
		home: 'beranda',
		menu: 'Menu',
		language: 'Bahasa',
		links: {
			why: 'Mengapa',
			proof: 'Benchmark',
			vsMcp: 'vs MCP',
			fix: 'Pasang',
			issues: 'Masalah',
			docs: 'Docs'
		}
	},

	footer: {
		tagline: 'Tool WebMCP standar untuk situs apa pun, plus linter untuk tool Anda.',
		license: 'Lisensi MIT · proyek komunitas independen.',
		badge: 'Situs ini siap agent: cek langsung',
		columns: { product: 'Produk', project: 'Proyek', webmcp: 'WebMCP' },
		links: {
			scan: 'Scan situs Anda',
			proof: 'Benchmark',
			install: 'Pasang',
			issues: 'Masalah yang diatasi',
			brand: 'Merek dan desain',
			trademark: 'Kebijakan merek dagang',
			spec: 'Draf spesifikasi',
			specIssues: 'Issue spesifikasi'
		},
		notices: [
			'webmcpx adalah proyek independen, tidak berafiliasi dengan maupun didukung oleh LF Projects, Agentic AI Foundation, Anthropic, W3C, Google, atau Microsoft.',
			'Model Context Protocol dan logo MCP adalah merek dagang LF Projects, LLC.',
			'W3C® adalah merek dagang World Wide Web Consortium.'
		]
	},

	hero: {
		stamp: 'Baru',
		draft: 'Mengikuti draf WebMCP per {date}',
		title: { text: 'Jadikan situs Anda {mark}.', mark: 'siap agent' },
		lead: 'Agent AI sudah membaca halaman Anda. Lihat apa yang mereka dapat, lalu beri mereka tool sungguhan dengan satu baris.',
		try: 'Coba {sites}'
	},

	logos: {
		title: { text: '{count} sudah fasih WebMCP.', count: { other: '{n}+ situs' } },
		lead: 'Klik salah satunya untuk scan langsung.',
		scan: '{site}: scan situs ini',
		note: 'Jumlah: situs live di {directory} ({date}). Menurut {knownGood} yang lebih ketat, {n} situs mendaftarkan tool saat halamannya dijalankan ({verifiedDate}). Logo dicek dengan scanner pada {checked}; semua logo milik pemiliknya masing-masing, tanpa afiliasi.',
		directory: 'direktori webmcp.com',
		knownGood: 'indeks Known Good'
	},

	sources: {
		title: 'Sumber',
		draft: 'Draf WebMCP',
		explainer: 'Explainer WebMCP',
		ours: 'Benchmark kami',
		snapshotCost: 'Biaya snapshot, terukur',
		shopifyCheckout: 'Checkout Shopify',
		mcpSpec: 'Spesifikasi MCP',
		shopifyBoth: 'Shopify di keduanya'
	},

	why: {
		kicker: 'Mengapa WebMCP?',
		title: 'Beri agent kontrak yang jelas, bukan screenshot.',
		lead: 'Dengan WebMCP, halaman Anda menyerahkan tool bertipe kepada agent AI, dan tool itu berjalan di tab milik pengguna sendiri. Inilah yang berubah, dimulai dari bukti terkuat.',
		today: 'Saat ini',
		with: 'Dengan WebMCP',
		reasons: {
			finish: {
				title: 'Agent yang menuntaskan tugas',
				pain: 'Di situs live, agent terbaik yang diuji gagal di sekitar 4 dari 10 tugas, kebanyakan saat berurusan dengan filter, pengurutan, dan navigasi.',
				gain: 'Agent memanggil tool dengan input bertipe, bukan menebak tombol mana yang melakukan apa.'
			},
			tokens: {
				title: 'Hanya sebagian kecil token',
				pain: 'Satu snapshot halaman bisa memakan 12.000 hingga 77.000 token, dan agent mengirimnya ulang di setiap langkah.',
				gain: 'Satu panggilan hanya mengembalikan data yang diminta: hingga {best} lebih sedikit token di {bestSite} dalam benchmark kami (kasus terbaik).'
			},
			speed: {
				title: 'Hitungan detik, bukan menit',
				pain: 'Lihat, pikir, klik, ulangi: pada tugas sulit di situs live, agent berjalan hingga 44 menit.',
				gain: 'Satu panggilan menggantikan serangkaian klik: median 3,4× lebih cepat dalam benchmark WindTunnel.'
			},
			backend: {
				title: 'Tanpa server baru. Tanpa OAuth.',
				pain: 'Memberi agent akses lewat API biasanya berarti backend terpisah, state ganda, dan alur autentikasi.',
				gain: 'Tool adalah kode front-end Anda, berjalan dengan sesi yang sudah dimiliki pengguna. Shopify menerapkannya dengan cara ini.'
			},
			loop: {
				title: 'Pengguna tetap memegang kendali',
				pain: 'Agent bertindak tanpa terlihat, atau mengalihkan pengguna ke tempat lain.',
				gain: 'Agent bekerja di halaman yang dilihat pengguna, dan tool bisa menandai aksi yang perlu konfirmasi.'
			},
			state: {
				title: 'Keranjang sama, formulir sama',
				pain: 'API backend tidak bisa melihat keranjang, formulir, atau pilihan yang sedang terbuka di tab pengguna.',
				gain: 'Tool bekerja pada state yang dilihat pengguna, jadi halaman ikut diperbarui saat agent bekerja.'
			},
			control: {
				title: 'Anda yang menentukan aksi agent',
				pain: 'Agent yang membaca halaman bisa mengeklik apa pun yang bisa diklik pengguna.',
				gain: 'Anda yang menerbitkan aksinya, input-nya, dan validasi Anda sendiri.'
			},
			small: {
				title: 'Mudah dipasang, aman diabaikan',
				pain: 'Membuat situs siap agent terdengar seperti proyek besar.',
				gain: 'Cukup beberapa registrasi tool. Browser tanpa WebMCP melewatinya, dan satu header bisa mematikannya.'
			}
		},
		status:
			'WebMCP adalah draf W3C Community Group (2 November 2026), bukan standar W3C. Browser di aplikasi desktop ChatGPT dan Codex bisa memanggil tool WebMCP milik sebuah situs; di Chrome, WebMCP berjalan lewat flag atau origin trial. Anotasi adalah petunjuk yang dideklarasikan situs, bukan jaminan.',
		also: 'Selain itu:'
	},

	proof: {
		kicker: 'Benchmark',
		title: 'Agent sama. Pertanyaan sama.',
		lead: 'Satu agent membaca, mengeklik, dan mengisi lewat snapshot halaman; yang lain memanggil tool WebMCP milik situs. Pilih model; penghematan terbesar ditampilkan lebih dulu.',
		byModel: 'Benchmark per model',
		models: 'Model',
		model: 'Model',
		site: 'Situs',
		tiers: { cheap: 'murah', frontier: 'frontier' },
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'Belum ada run yang dipublikasikan.',
			text: 'Jalankan {command}, lalu bagian ini akan terisi.'
		},
		selected: {
			other:
				'Kasus pilihan: {shown} dari {total} pertanyaan, yaitu yang menghabiskan paling banyak separuh token dengan WebMCP. {results} terbuka untuk publik, atau jalankan sendiri dengan {command}.'
		},
		results: 'Semua hasil',
		none: {
			title: 'Tidak ada pertanyaan yang lolos ambang di {model}.',
			text: 'Semua pertanyaan dan kedua varian ada di hasil lengkap di atas.'
		},
		local: 'lokal',
		arms: { baseline: 'Tanpa WebMCP', webmcp: 'Dengan WebMCP' },
		tokens: 'token',
		stats: '{time} · {steps} langkah · {cost} per 1.000',
		na: 't/a',
		solved: 'Berhasil {n}',
		failed: 'Gagal {n}',
		fewerTokens: 'hemat token',
		moreTokens: 'boros token',
		open: 'Buka',
		opens: '(membuka {site})',
		rotator: {
			label: 'Pertanyaan',
			item: 'Pertanyaan {n} dari {total}',
			pause: 'Jeda rotasi',
			resume: 'Lanjutkan rotasi'
		},
		details: 'Detail untuk {site}',
		tabs: {
			tokens: 'Token',
			duration_ms: 'Waktu',
			steps: 'Langkah',
			cost_usd: 'Biaya',
			tools: 'Tool',
			method: 'Metode'
		},
		metrics: {
			tokens: { label: 'Token', unit: 'token per run', column: 'token' },
			duration_ms: { label: 'Waktu', unit: 'detik per run', column: 'waktu' },
			steps: { label: 'Langkah', unit: 'giliran model per run', column: 'langkah' },
			cost_usd: { label: 'Biaya', unit: 'USD per 1.000 run', column: 'biaya' }
		},
		chart: {
			question: 'Pertanyaan',
			solved: 'Berhasil',
			head: '{metric} · {unit}',
			caption: '{metric} per pertanyaan, {unit}; makin rendah makin baik. Tingkat keberhasilan per varian.',
			armMetric: '{arm}: {metric}',
			armSolved: '{arm}: berhasil',
			row: '{site}: {question}',
			localSite: '{site} (situs uji lokal)'
		},
		method: {
			setup: {
				other:
					'{model}, reasoning {effort}, Chrome headless. Prompt dan batas langkah sama di kedua varian; {n} run per pertanyaan per varian.'
			},
			setupNoEffort: {
				other:
					'{model}, Chrome headless. Prompt dan batas langkah sama di kedua varian; {n} run per pertanyaan per varian.'
			},
			baseline: 'Tanpa WebMCP: agent berbasis snapshot DOM yang membaca, mengeklik, dan mengisi.',
			webmcp:
				'Dengan WebMCP: hanya tool yang didaftarkan halaman (milik situs itu sendiri, atau dari webmcpx di situs uji kami).',
			graded: 'Dinilai dari fakta dalam jawaban dan state halaman. Tanpa LLM judge.',
			live: 'Situs live: menyediakan tool WebMCP-nya sendiri.',
			local: 'Situs uji lokal: tool-nya berasal dari webmcpx.',
			reproduce: 'reproduksi sendiri'
		},
		tools: {
			label: 'Tool WebMCP di {site}',
			title: { other: '{n} tool WebMCP yang didaftarkan {site}' },
			fromRun: 'seperti yang dilihat agent · {date}',
			fromSnapshot: 'deskripsi per {date} · benchmark dijalankan {runDate}',
			tool: 'Tool',
			description: 'Deskripsi',
			called: 'Dipakai',
			notCalled: 'Tidak dipakai',
			missing: '(belum terdaftar saat snapshot diambil)'
		}
	},

	versus: {
		kicker: 'WebMCP vs MCP',
		title: 'Konsep tool yang sama. Tempat yang berbeda.',
		lead: 'WebMCP meminjam model tool dari MCP, tetapi WebMCP adalah API browser, bukan protokol MCP. Keduanya saling melengkapi.',
		caption: 'Perbandingan WebMCP dan MCP',
		aspect: 'Aspek',
		rows: {
			where: {
				label: 'Tempat tool berjalan',
				webmcp: 'Di JavaScript halaman Anda, di tab pengguna.',
				mcp: 'Di proses server, lokal (stdio) atau remote.'
			},
			call: {
				label: 'Cara agent memanggil',
				webmcp:
					'API browser, document.modelContext; browser menjadi perantara setiap panggilan. Tanpa JSON-RPC.',
				mcp: 'JSON-RPC 2.0 lewat stdio atau Streamable HTTP.'
			},
			run: {
				label: 'Yang Anda jalankan',
				webmcp: 'Front end yang sudah Anda punya. Tanpa server baru.',
				mcp: 'Server MCP yang Anda host dan kelola sendiri.'
			},
			auth: {
				label: 'Autentikasi',
				webmcp: 'Sesi login pengguna yang sudah ada. Tidak perlu menerbitkan token.',
				mcp: 'Otorisasi berbasis OAuth untuk server remote.'
			},
			discovery: {
				label: 'Penemuan tool',
				webmcp: 'Begitu halaman dibuka. Tidak ada yang perlu dicari sebelum kunjungan.',
				mcp: 'tools/list di endpoint yang sudah diketahui, plus registry publik.'
			},
			lifetime: {
				label: 'Masa aktif',
				webmcp: 'Selama halaman terbuka.',
				mcp: 'Selalu aktif, tanpa perlu browser.'
			},
			user: {
				label: 'Pengguna',
				webmcp: 'Hadir, di halaman yang sama dengan agent.',
				mcp: 'Opsional: bisa berjalan headless.'
			},
			covers: {
				label: 'Cakupan',
				webmcp: 'Hanya tool, dengan skema input dan output.',
				mcp: 'Tool, resource, dan prompt, plus elicitation dan ekstensi.'
			},
			hints: {
				label: 'Petunjuk pada tool',
				webmcp: 'readOnlyHint, consequentialHint, untrustedContentHint. Secara default same-origin.',
				mcp: 'readOnlyHint, destructiveHint, idempotentHint, openWorldHint.'
			},
			status: {
				label: 'Status',
				webmcp: 'Draf W3C Community Group. Bisa dipanggil ChatGPT desktop dan Codex; Chrome: origin trial.',
				mcp: 'Proyek Linux Foundation, 10.000+ server publik.'
			}
		},
		useBoth: 'Pakai keduanya',
		verdict:
			'MCP melayani agent yang tidak pernah membuka situs Anda. WebMCP melayani agent yang bekerja di tab Anda, berdampingan dengan pengguna. Jalankan keduanya di satu backend: Shopify sudah melakukannya.'
	},

	fix: {
		title: 'Satu baris. Siap agent.',
		lead: 'Tempel sebelum {tag}. Di browser tanpa WebMCP, baris ini tidak melakukan apa-apa.',
		alternative: 'atau {code} untuk {label}',
		alternatives: { npm: 'npm', agent: 'coding agent Anda' },
		gives: {
			search_page: 'menemukan bagian teks',
			fetch_as_markdown: 'membaca halaman bertahap',
			get_page_context: 'mengenali posisinya'
		},
		facts: '~2,8 KB dimuat · Rust + WebAssembly · lisensi MIT',
		see: {
			title: 'Lihat langsung',
			chatgpt:
				'Buka halaman Anda di browser aplikasi desktop ChatGPT atau di Codex: keduanya memanggil tool WebMCP ({docs}).',
			docs: 'dokumentasi OpenAI',
			chrome: 'Atau di Chrome: aktifkan {flag}, jalankan ulang, lalu buka DevTools › Application › WebMCP.',
			live: 'Mau live di Chrome? Tambahkan token origin trial Anda di tag {meta}.'
		},
		agent: 'Atau minta coding agent Anda:'
	},

	issues: {
		kicker: 'Dari tracker spesifikasi',
		title: 'Yang diminta komunitas. Sudah dirilis.',
		items: {
			shared: {
				title: 'Tool bersama',
				fix: 'Satu tag script mendaftarkan search_page, fetch_as_markdown, dan get_page_context dari webmcpx; search_site juga, jika Anda menyertakan pencarian situs Anda.'
			},
			errors: {
				title: 'Error yang jelas bagi agent',
				fix: 'Tool webmcpx mengembalikan kegagalan yang sudah diperkirakan sebagai hasil: kode error yang stabil, flag retryable, dan petunjuk.'
			},
			paging: {
				title: 'Paginasi hasil',
				fix: 'Semua tool webmcpx memakai satu bentuk hasil, dengan batas output serta paginasi truncated + next_cursor.'
			},
			frozen: {
				title: 'modelContext yang dibekukan',
				fix: 'webmcpx hanya memanggil registerTool(), tidak pernah melakukan assignment. Diuji pada modelContext yang dibekukan.'
			},
			hidden: {
				title: 'Instruksi tersembunyi',
				fix: 'Dihapus dari teks halaman saat runtime; linter menandainya dan --fix menghapusnya dari source.'
			},
			length: {
				title: 'Batas panjang',
				fix: 'webmcpx lint memeriksa aturan nama dan menandai deskripsi yang melebihi panduan Chrome.'
			},
			budget: {
				title: 'Batas jumlah tool',
				fix: 'webmcpx lint memberi peringatan di atas 20 tool per halaman dan error di atas 100 (kebijakan kami, bukan dari draf).'
			}
		}
	},

	scan: {
		form: 'Scan situs',
		address: 'Alamat situs Anda',
		placeholder: 'situsanda.com',
		submit: 'Mulai scan',
		scanning: 'Sedang scan…',
		steps: [
			'Membuka halaman…',
			'Mencari tool WebMCP…',
			'Membaca seperti agent…',
			'Memeriksa tool dengan linter…'
		],
		verdicts: { ready: 'Siap agent', issues: 'Hampir', missing: 'Belum' },
		failed: 'Situs itu tidak bisa di-scan.',
		result: {
			missing: 'Tidak ada tool WebMCP. Agent harus membaca sekitar {tokens} dari halaman ini lalu menebak.',
			tokens: { other: '{n} token' },
			issues: {
				other: '{tools}, tetapi ada {n} error lint yang akan menjegal agent.'
			},
			toolCount: { other: '{n} tool' },
			ready: {
				other: '{n} tool yang bisa langsung dipanggil agent. Mantap.'
			},
			readySelf: {
				other: '{n} tool yang bisa langsung dipanggil agent. Masa pembuatnya sendiri belum.'
			},
			tools: 'Tool yang ditemukan',
			more: '+{n} lainnya',
			findings: 'Temuan lint',
			fix: 'Perbaiki dengan satu baris. Tempel sebelum {tag}:',
			lint: 'Temukan semua masalah di source Anda, lengkap dengan perbaikannya:',
			terminal: 'terminal',
			badge: 'Tunjukkan. Pilih badge, lalu tempel di situs Anda:',
			badgeNote:
				'SVG-nya ada di dalam kode, jadi tidak ada yang dimuat dari server kami. Badge ini menautkan ke scan langsung situs Anda, jadi siapa pun bisa mengeceknya.',
			badgeStyle: 'Gaya badge',
			badgeTitle: 'Siap agent: cek langsung dengan webmcpx',
			share: 'Bagikan hasil',
			shared: 'Tautan disalin'
		},
		badges: {
			card: { name: 'Kartu', fits: 'Halaman terang' },
			flat: { name: 'Datar', fits: 'Footer' },
			readme: { name: 'README', fits: 'GitHub dan npm' },
			dark: { name: 'Gelap', fits: 'Halaman gelap' }
		},
		errors: {
			invalid: 'Ketik situs seperti notion.com atau https://example.com/docs.',
			offline: 'Scanner sedang offline. Jalankan secara lokal dengan `just serve`.',
			noScanner: 'Salinan situs ini tidak punya scanner. Jalankan secara lokal dengan `just serve`.',
			busy: 'Maaf, hanya satu scan per menit. Coba lagi dalam {s} detik.',
			busyLater: 'Scanner sedang sibuk. Coba lagi dalam satu menit.',
			timeout: 'Halaman terlalu lama merespons.',
			badAddress: 'Alamat itu tidak bisa di-scan.',
			unreadable: 'Halaman tidak bisa dibaca.',
			withDetail: '{lead} ({detail})',
			other: 'Scan gagal ({status}).'
		}
	},

	brand: {
		kicker: 'Panduan merek · sistem desain',
		title: 'Kertas, tinta, dan satu titik temu.',
		lead: 'Halaman mendeklarasikan tool-nya; browser berada di antaranya; halaman dan agent bertemu tanpa saling menggantikan. Logo ini menggambarkan pertemuan itu. Semua yang ada di bawah dirender dari kode yang benar-benar dirilis.',
		name: {
			kicker: '01 · Nama',
			title: 'webmcpx, selalu huruf kecil',
			rules: [
				'Selalu huruf kecil: webmcpx, juga di awal kalimat (lebih baik susun ulang kalimatnya).',
				'Di kode dan perintah, tulis dengan Geist Mono.',
				'WebMCP adalah API browser, ditulis sesuai ejaan di draf. webmcp.zone adalah situs komunitas.',
				'webmcpx bukan WebMCP itu sendiri dan tidak pernah mengklaim nama WebMCP.'
			]
		},
		logo: {
			kicker: '02 · Logo',
			title: 'Tiga logo, satu gagasan',
			lead: 'Gunakan Junction di mana pun memungkinkan. Kartu adalah badge dan ikon aplikasi (32px ke atas); Halaman dengan slot adalah alternatifnya.',
			marks: {
				junction: { name: 'Junction', role: 'Logo utama' },
				card: { name: 'Kartu', role: 'Badge dan ikon aplikasi, 32px ke atas' },
				'page-slot': { name: 'Halaman dengan slot', role: 'Alternatif' }
			},
			assets: {
				mark: { label: 'Logo', use: 'Satu warna (currentColor). Dokumentasi, README, slide.' },
				inverse: { label: 'Negatif', use: 'Kertas di atas persegi tinta.' },
				favicon: { label: 'Favicon', use: '16–32px. Mengikuti mode terang dan gelap.' },
				appIcon: { label: 'Ikon app', use: 'Berwarna, untuk ekspor 512px.' },
				avatar: { label: 'Avatar', use: 'Padding 20%: aman untuk crop lingkaran.' }
			},
			asset: '{label} {use}',
			assetLabel: '{label}.',
			download: 'Unduh SVG {asset} {mark}'
		},
		construction: {
			kicker: '03 · Konstruksi',
			title: 'Grid 24 unit, celah 2 unit',
			lead: 'Dua chevron padat yang saling mencerminkan. Lengan 4,5 unit di ujungnya, puncak dipotong rata sepanjang 2 unit, dan celah 2 unit di antaranya yang tidak pernah tertutup: celah itulah browser.',
			grid: 'Junction digambar di atas grid 24 unit',
			clearSpace: 'Ruang kosong',
			clearSpaceText:
				'Sisakan ruang kosong di sekitar logo setara setengah tingginya, dan di sekitar lockup setara tinggi huruf x.',
			minSize: 'Ukuran minimum',
			minSizeText: 'Logo sekecil 16px hanya untuk varian favicon. Lockup minimal setinggi 24px.'
		},
		color: {
			kicker: '04 · Warna',
			title: 'Kertas dan tinta, satu stabilo',
			lead: 'Nilai dibaca dari tokens.css. Pilih artwork sesuai latar tempatnya diletakkan, bukan sesuai tema pembaca.',
			uses: {
				paper: 'Latar halaman',
				'paper-2': 'Panel cekung, track',
				card: 'Kartu dan input di atas kertas',
				ink: 'Teks, outline, bayangan, tombol utama',
				'ink-2': 'Teks sekunder',
				'ink-3': 'Keterangan dan label',
				hairline: 'Pemisah tipis',
				marker: 'Stabilo: satu-satunya aksen',
				good: 'Siap, lulus (teks)',
				'good-soft': 'Siap, lulus (isian)',
				bad: 'Tidak ada, gagal (teks)',
				'bad-soft': 'Tidak ada, gagal (isian)',
				code: 'Latar blok kode',
				'on-code': 'Teks di blok kode'
			},
			pairs: 'Pasangan teks yang disetujui',
			pairsNote: 'WCAG 2.2 AA mensyaratkan 4,5:1 untuk teks isi; sebuah tes memastikannya.',
			pairsText: 'Teks di atas latar',
			pairsContrast: 'Kontras',
			pair: '{text} di atas {bg}',
			yellow: 'Kuning untuk latar, bukan untuk bentuk',
			yellowText:
				'Kuning stabilo di atas kertas hanya {ratio}: tidak sanggup membawa bentuk atau teks. Gunakan di belakang tinta: {word}, chip, ikon aplikasi.',
			yellowWord: 'kata yang distabilo'
		},
		type: {
			kicker: '05 · Tipografi',
			title: 'Bricolage, Geist, Geist Mono',
			styles: {
				giant: { name: 'Bricolage Grotesque · raksasa', sample: 'Siap agent' },
				headline: { name: 'Bricolage Grotesque · judul', sample: 'Agent sama. Pertanyaan sama.' },
				body: {
					name: 'Geist · teks isi',
					sample: 'Kalimat pendek yang bisa dicek. Satu gagasan per kalimat.'
				},
				mono: { name: 'Geist Mono · kode dan label', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · Komponen',
			title: 'Outline 2px, bayangan tegas',
			lead: 'src/lib/components/ui. Varian adalah resep tailwind-variants; bentuknya berasal dari token yang sama.',
			buttons: 'Button · varian × ukuran',
			stamps: 'Stamp · nada',
			card: 'Card',
			interactive: 'Card interaktif (hover)',
			empty: 'Keadaan kosong',
			tabs: 'Tabs',
			tabsLabel: 'Contoh',
			tabsItems: { one: 'Pertama', two: 'Kedua' },
			tabsPanel: 'Panel untuk {label}. Gunakan tombol panah.',
			codeBlock: 'CodeBlock (di-highlight saat build)'
		},
		misuse: {
			kicker: '07 · Salah pakai',
			title: 'Jangan',
			items: {
				stretch: 'Jangan meregangkan atau memampatkannya',
				rotate: 'Jangan memutarnya',
				outline: 'Jangan menambahkan outline atau garis tepi',
				yellow: 'Jangan menggambarnya dengan warna kuning',
				shadow: 'Jangan menambahkan bayangan atau efek pada logo',
				touch: 'Jangan menutup celah di antara chevron'
			}
		},
		trademark: {
			kicker: '08 · Merek dagang',
			title: 'Pakai namanya dengan bebas. Jangan terkesan resmi.',
			lead: 'Kodenya berlisensi MIT; nama dan logonya tidak termasuk dalam lisensi itu. Kebijakan lengkapnya ada di TRADEMARK.md.',
			sayIt: 'Tulis seperti ini',
			never: 'Jangan pernah',
			ok: [
				'Mengimplementasikan WebMCP Draft Community Group Report dari W3C Web Machine Learning Community Group (bukan standar W3C).',
				'Dibuat dengan webmcpx. Kompatibel dengan webmcpx.',
				'Berjalan di Chrome dengan flag WebMCP diaktifkan.'
			],
			no: ['Library WebMCP resmi', 'Standar W3C WebMCP', 'Bersertifikat MCP', 'webmcpx untuk Chrome'],
			voice: 'Gaya bahasa',
			voiceText: 'Kalimat pendek yang bisa dicek. Angka, bukan kata sifat.',
			wordsUse: 'Kata yang kami pakai',
			wordsAvoid: 'Kata yang kami hindari',
			use: [
				'mendeklarasikan',
				'mengekspos',
				'memanggil',
				'terukur',
				'mengikuti draf Community Group',
				'bekerja dengan webmcpx'
			],
			avoid: ['resmi', 'standar W3C', 'sesuai standar W3C', 'bersertifikat MCP', 'revolusioner', 'ajaib'],
			notices: 'Pemberitahuan',
			read: 'Baca TRADEMARK.md'
		}
	},

	benchmarkPage: {
		back: 'Kembali ke halaman utama'
	},

	ui: {
		copy: 'Salin',
		copied: 'Disalin',
		copyLabel: 'Salin ke clipboard',
		copyNamed: 'Salin {title}',
		code: 'Kode {title}'
	}
};

export default id;
