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
		verdicts: {
			title: 'Cara kerja verdik pemindaian · webmcpx',
			description:
				'Arti tiap verdik pemindaian, cara pemindaian berjalan, dan tempat melapor jika verdik salah.'
		},
		home: {
			title: 'webmcpx: WebMCP untuk setiap situs dan setiap agen',
			description:
				'Scan situs mana pun untuk tool WebMCP, beri situs Anda tool WebMCP dengan satu baris, dan beri Claude Code atau Codex WebMCP di setiap situs. Open source.'
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
			proof: 'Peringkat',
			vsMcp: 'vs MCP',
			sites: 'Untuk situs',
			agents: 'Untuk agen',
			issues: 'Celah',
			docs: 'Docs'
		}
	},

	footer: {
		tagline: 'Tool WebMCP standar untuk situs apa pun, plus linter untuk tool Anda.',
		license: 'Lisensi MIT · proyek komunitas independen.',
		// The site sets no cookies and loads no analytics or tracking script: keep it literally true.
		privacy: 'Tanpa cookie, tanpa skrip pelacak.',
		badge: 'Situs ini siap agent: cek langsung',
		columns: { product: 'Produk', project: 'Proyek', webmcp: 'WebMCP' },
		links: {
			scan: 'Scan situs Anda',
			verdicts: 'Cara kerja verdik',
			proof: 'Peringkat',
			sites: 'Untuk situs',
			agents: 'Untuk agen',
			issues: 'Celah',
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
		title: { text: 'Jadikan situs Anda {mark}', mark: 'siap agent' },
		lead: 'Di benchmark kami, agen memakai {mark} dengan WebMCP (kasus terbaik: {site}, {model}). Lihat apa yang didapat agen dari situs Anda, lalu perbaiki dengan satu baris.',
		// The part of the lead set in highlighter ({best} is the ratio).
		leadMark: 'hingga {best} lebih sedikit token',
		// Without a published run (no number to quote).
		leadPlain:
			'Agent AI sudah membaca halaman Anda. Lihat apa yang mereka dapat, lalu beri mereka tool sungguhan dengan satu baris.',
		try: 'Coba {sites}',
		// Under the headline: why it's safe to try. Short items joined by ' · '.
		trust: 'Open source · tanpa daftar · tanpa cookie',
		entry: { question: 'Tidak punya situs, hanya pakai agen?', agent: 'Siapkan agen Anda' }
	},

	logos: {
		title: { text: '{count} sudah fasih WebMCP', count: { other: '{n}+ situs' } },
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

	what: {
		kicker: 'Apa itu WebMCP?',
		title: 'WebMCP sedang menjadi standar web untuk agen AI. Kami all in',
		lead: 'Para engineer dari Google dan Microsoft sedang menyusunnya di W3C, lembaga di balik standar-standar web, dan Chrome serta Edge sudah mengujinya. Saat ini, Claude Code, Codex, dan semua agen lain memakai situs Anda seperti screenshot: melihat, menebak tombol mana yang harus ditekan, lalu mencoba lagi. Lambat, mahal, gampang rusak. Dengan WebMCP, situs Anda memberi tahu agen dengan tepat apa yang bisa mereka lakukan, seperti mencari, membaca, atau menambahkan ke keranjang, dan mereka tinggal meminta. Kami yakin setiap situs akan berbicara WebMCP, jadi kami membuat webmcpx agar situs Anda bisa melakukannya hari ini.',
		sources: {
			mind2web: 'Online-Mind2Web: agent gagal di sekitar 4 dari 10 tugas live',
			snapshot: 'Satu snapshot halaman memakan 12k hingga 77k token',
			windtunnel: 'WindTunnel: tool vs klik, diukur waktunya',
			draft: 'Draf WebMCP, W3C Web Machine Learning CG (editor dari Google dan Microsoft)',
			status: 'Status implementasi (origin trial di Chrome dan Edge)',
			chromeTrial: 'Chrome: origin trial WebMCP',
			chromeStatus: 'Chrome Platform Status',
			edgeTrial: 'Microsoft Edge: origin trial WebMCP',
			edgeExplainer: 'Explainer Microsoft Edge',
			method: 'Metode benchmark kami'
		},
		steps: {
			register: {
				title: 'Situs Anda mendaftarkan tool-nya',
				text: 'Setiap tool adalah aksi dengan nama dan deskripsi singkat, seperti “cari produk” atau “tambah ke keranjang”: hal yang sudah dilakukan tombol Anda.'
			},
			list: {
				title: 'Agent melihat daftarnya',
				text: 'Browser memberinya tool situs Anda dan apa yang dibutuhkan masing-masing, tanpa membaca seluruh halaman dan menebak.'
			},
			call: {
				title: 'Agent memakainya',
				text: 'Langsung di tab pengunjung sendiri, sudah masuk: tanpa server baru, tanpa login tambahan.'
			}
		},
		webmcpx: {
			// Who we are and why webmcpx exists, right under the logo (facts only: see the footer notices).
			about:
				'Proyek komunitas independen dan open source, tidak berafiliasi dengan W3C maupun pembuat browser mana pun. Kami membuat webmcpx agar WebMCP bermanfaat hari ini: situs mendapat tool yang baik tanpa menulisnya, agen mendapat jawaban yang sama dengan lebih sedikit token, dan setiap angka yang kami terbitkan bisa diuji ulang.',
			title: 'Mulai pakai webmcpx hari ini, di situs dan agen Anda',
			lead: 'Semua yang hari ini membuat WebMCP belum ada di kebanyakan situs, beres: satu baris di situs Anda, satu perintah di agen Anda, dan tak ada lagi yang perlu dipikirkan.',
			compare: {
				caption: 'WebMCP manual dibandingkan dengan webmcpx',
				hand: 'WebMCP manual',
				webmcpx: 'Dengan webmcpx'
			},
			items: {
				support: {
					label: 'Dukungan browser',
					hand: 'Hanya Chrome dan Edge, lewat flag atau origin trial. Firefox dan Safari: belum ada.',
					webmcpx:
						'Polyfill resmi W3C di mana pun WebMCP belum ada: tool Anda sudah tersedia hari ini di Chrome, Firefox, dan Safari.'
				},
				tools: {
					label: 'Tool di setiap halaman',
					hand: 'Anda merancang dan menulis setiap tool, halaman demi halaman.',
					webmcpx:
						'Pencarian, pembacaan, dan konteks halaman di setiap halaman dari satu tag script. Tanpa kode.'
				},
				actions: {
					label: 'Aksi Anda sendiri',
					hand: 'Skema, anotasi, dan penanganan error, ditulis manual untuk masing-masing.',
					webmcpx:
						'Satu panggilan tool(), hook untuk React, Vue, atau Svelte, atau formulir yang sudah Anda punya.'
				},
				agents: {
					label: 'Di Claude Code, Codex, Cursor',
					hand: 'Membangun bridge sendiri, atau menunggu tiap agen mendukungnya.',
					webmcpx:
						'npx webmcpx mcp: tool tiap halaman, plus tool standar di situs mana pun, bahkan tanpa webmcpx.'
				},
				draft: {
					label: 'Perubahan spesifikasi',
					hand: 'Mengikuti setiap perubahan draf dan menulis ulang tool Anda.',
					webmcpx: 'Kami mengikuti draf W3C dan bergerak bersamanya: Anda cukup memperbarui satu paket.'
				},
				correct: {
					label: 'Membuatnya benar',
					hand: 'Bentuk hasil, kode error, batas output, paginasi, anotasi: semuanya tanggung jawab Anda.',
					webmcpx:
						'Benar sejak awal: satu bentuk hasil, kode error yang bisa ditindaklanjuti agen, batas output, paginasi, dan anotasi yang benar.'
				},
				safe: {
					label: 'Aman untuk agen',
					hand: 'Instruksi tersembunyi dan karakter tak terlihat di deskripsi tool atau teks halaman: mudah terlewat, mudah dieksploitasi.',
					webmcpx:
						'Tool standar hanya membaca, teks tersembunyi tidak ikut, karakter tak terlihat dibuang, dan linter menandai instruksi tersembunyi di tool Anda.'
				},
				testing: {
					label: 'Pengujian',
					hand: 'Nyalakan flag Chrome, buka DevTools, lalu berharap.',
					webmcpx:
						'npx webmcpx tools localhost:3000 menampilkan daftar tool Anda di browser apa pun, tanpa flag; scanner mengecek URL live mana pun.'
				},
				proof: {
					label: 'Bukti bahwa ini sepadan',
					hand: 'Tebakan Anda.',
					webmcpx:
						'Benchmark publik WebMCP vs membaca halaman: hingga {best} lebih sedikit token untuk jawaban yang sama (kasus terbaik: {site}, {model}). Jalankan ulang dengan satu perintah.',
					webmcpxPlain:
						'Setiap pertanyaan dan setiap eksekusi terbuka untuk publik: jalankan ulang dengan satu perintah.'
				},
				cost: {
					label: 'Biaya',
					hand: 'Waktu Anda, di setiap halaman dan setiap perubahan.',
					webmcpx: 'Gratis dan open source (MIT), sekitar 2,7 KB saat dimuat, tanpa akun, tanpa server.'
				}
			},
			sites: 'Pasang di situs Anda',
			agents: 'Pasang di agent Anda'
		}
	},
	why: {
		kicker: 'Mengapa WebMCP?',
		title: 'Apa yang didapat situs Anda dengan WebMCP',
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
				title: 'Tanpa server baru. Tanpa OAuth',
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
		kicker: 'Peringkat',
		title: 'Seberapa banyak WebMCP menghemat, per model',
		lead: 'Satu agent membaca, mengeklik, dan mengisi lewat snapshot halaman; yang lain memanggil tool WebMCP milik situs. Pilih model; penghematan terbesar ditampilkan lebih dulu.',
		byModel: 'Benchmark per model',
		models: 'Model',
		model: 'Model',
		site: 'Situs',
		rank: 'Peringkat {n}',
		ranking: 'Diurutkan menurut keberhasilan dengan WebMCP, lalu biaya per eksekusi.',
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'Belum ada run yang dipublikasikan',
			text: 'Jalankan {command}, lalu bagian ini akan terisi.'
		},
		selected: {
			other:
				'Kasus pilihan: {shown} dari {total} pertanyaan, yaitu yang menghabiskan paling banyak separuh token dengan WebMCP. {results} terbuka untuk publik, atau jalankan sendiri dengan {command}.'
		},
		results: 'Semua hasil',
		none: {
			title: 'Tidak ada pertanyaan yang lolos ambang di {model}',
			text: 'Semua pertanyaan dan kedua varian ada di hasil lengkap di atas.'
		},
		local: 'lokal',
		arms: { baseline: 'Tanpa WebMCP', webmcp: 'Dengan WebMCP' },
		tokens: 'token',
		stats: '{time} · {steps} langkah · {cost} per tugas',
		na: 't/a',
		solved: 'Berhasil {n}',
		failed: 'Gagal {n}',
		fewerTokens: 'hemat token',
		moreTokens: 'boros token',
		open: 'Buka',
		opens: '(membuka {site})',
		rotator: {
			label: 'Pertanyaan',
			role: 'karusel'
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
			cost_usd: { label: 'Biaya', unit: 'USD per tugas', column: 'biaya' }
		},
		chart: {
			question: 'Pertanyaan',
			solved: 'Berhasil',
			head: '{metric} · {unit}',
			better: 'Lebih pendek lebih baik',
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
			scope:
				'30 pertanyaan di 6 situs, 27 hanya membaca; penghematan terbesar datang dari alat pencarian milik situs itu sendiri.',
			runs: '3 eksekusi per pertanyaan dan lengan: 3 dari 3 adalah bukti, bukan jaminan 100%.',
			measures:
				'Waktu adalah loop agen setelah halaman dimuat; biaya adalah penggunaan API model dengan harga daftar bertanggal, termasuk cache.',
			failures:
				'Setiap eksekusi yang gagal menyebut alasannya di hasil (blokir situs, jawaban bukan dari halaman, batas langkah…).',
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
		title: 'Beda WebMCP dan MCP, dan mengapa Anda butuh keduanya',
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
		title: 'Untuk situs Anda',
		lead: 'Agen AI sudah membaca halaman Anda. Beri mereka tool sungguhan dalam dua langkah: minta agen coding Anda (Claude Code, Codex, Cursor), atau lakukan manual.',
		alternatives: { npm: 'npm', agent: 'Agent' },
		facts: '~2,7 KB dimuat · Rust + WebAssembly · lisensi MIT',
		html: 'Tempel sebelum {tag}. Di browser tanpa WebMCP, ia menambahkan polyfill W3C.',
		standard: {
			title: 'Alat standar: satu baris',
			lead: 'Pencarian, membaca, dan konteks halaman di setiap halaman. Tanpa kode.'
		}
	},

	agents: {
		title: 'Untuk agen Anda',
		lead: 'Agen Anda membaca setiap halaman dengan cara yang mahal. Berikan saja tool milik halaman itu: di situs yang kami ukur, jawabannya sama dengan sebagian kecil token. Bekerja di situs mana pun, dan inilah MCP yang wajib ada di setiap setup Claude Code dan Codex.',
		saving: {
			range: { other: '{low} hingga {high} lebih sedikit token di semua {n} model peringkat.' },
			best: 'Hingga {high} lebih sedikit token di peringkat.',
			losses: {
				other:
					'Seluruh run: pada {worse} dari {total} pertanyaan per model, WebMCP memakai lebih banyak token.'
			}
		},
		prompt: 'Satu prompt: agen Anda menyiapkan dirinya sendiri, lalu membuktikannya di webmcpx.dev.',
		ways: {
			mcp: {
				label: 'Agen dengan MCP',
				text: 'Claude Code, Codex, Cursor: tambahkan {cmd}. Ia membuka halaman di Chromium-nya sendiri, tanpa flag.'
			},
			browser: {
				label: 'Agen yang mengendalikan browser',
				text: 'Playwright, Selenium, Puppeteer, browser-use, CDP; Chrome, Firefox, Safari: panggil {api} di halaman. Setiap situs dengan webmcpx memilikinya.'
			}
		},
		hype: {
			up: 'Hingga',
			fewer: 'lebih sedikit token',
			same: 'Jawaban yang sama.',
			bestCase: 'Kasus terbaik: {site}, {model}'
		},
		worksWith: 'Bekerja dengan agen dan browser apa pun',
		note: 'Satu prompt: agen Anda menyiapkan dirinya, memakai WebMCP lebih dulu di mana saja, dan membuktikannya di webmcpx.dev.'
	},

	own: {
		title: 'Aksi situs Anda sendiri',
		lead: 'Tambah ke keranjang, pesan, cari di katalog: fungsi yang sudah dipanggil tombol Anda, sebagai alat yang dipanggil agen langsung.',
		notes: {
			agent:
				'Agen Anda membaca apa yang dilakukan webmcpx, menemukan aksi yang layak diekspos di proyek Anda, menanyakan mana yang ingin ditambahkan, lalu menambahkan dan mengeceknya.',
			form: 'Tanpa JavaScript: API deklaratif WebMCP. Tag script menambahkannya di browser yang belum punya.',
			js: 'Lewat npm, atau diimpor dari CDN yang sama dengan tag script.',
			hook: 'Terdaftar selama komponen terpasang, hilang saat dilepas.'
		}
	},

	verdicts: {
		title: 'Cara pemindai memutuskan',
		lead: 'Tiga verdik, aturan terbuka. Kalau ada yang terasa salah, beri tahu kami: masukan itulah yang membuatnya lebih baik.',
		// {rules} is a list of lint rule names (code).
		items: {
			ready:
				'Halaman mendaftarkan setidaknya satu tool WebMCP, linter tidak menemukan error di dalamnya, dan skor siap agent mencapai 70 atau lebih. Peringatan, seperti nama panjang, tidak menghalangi.',
			issues:
				'Halaman mendaftarkan tool, tetapi setidaknya satu punya error linter ({rules}, atau ukuran di atas batas kerasnya), atau skornya di bawah 70.',
			missing:
				'Halaman tidak mendaftarkan tool WebMCP. Kami tampilkan berapa token yang akan dihabiskan agen untuk membaca halaman sebagai gantinya.'
		},
		how: {
			title: 'Cara pemindaian berjalan',
			steps: [
				'Kami membuka halaman di Chrome headless di server kami, tanpa cookie dan tanpa login.',
				'Sebelum skrip halaman berjalan, kami menambahkan host WebMCP, agar halaman mendaftarkan tool-nya seperti di browser agen. Host ini juga menerima navigator.modelContext dan provideContext versi lama, agar situs yang memakainya tetap menampilkan tool-nya.',
				'Setelah halaman dimuat dan tool-nya stabil, kami membaca nama, deskripsi, skema input, dan anotasi tiap tool, lalu memeriksanya dengan linter.',
				'Token diperkirakan dari teks halaman: jumlah karakternya dibagi empat.',
				'Untuk skor, browser yang sama mengambil robots.txt, llms.txt, sitemap, versi Markdown, header Link, indeks Agent Skills, dan katalog API situs (masing-masing 3 s, origin yang sama, tanpa cookie), dan hanya mencatat ada atau tidaknya masing-masing.',
				'Skor, dari 100: WebMCP 50 (tool 25, tanpa error lint 15, semua tool berdeskripsi 5, semua tool beranotasi 5), biaya agent 15 (penuh jika ada tool; jika tidak, menurut jumlah token halaman), mudah dibaca 20, dan mudah ditemukan 15 (5 per pemeriksaan).',
				'Hasil dipakai ulang selama 5 menit; setiap pengunjung bisa menjalankan satu pemindaian dalam satu waktu. Kami mencatat alamat dan hasil setiap pemindaian, tidak pernah siapa yang menjalankannya.'
			]
		},
		rules: 'Semua aturan linter, beserta alasannya',
		disagree: 'Menurut Anda verdiknya salah? {link}',
		disagreeLink: 'Buka issue dengan tautan pemindaian.'
	},

	issues: {
		kicker: 'Dari tracker spesifikasi',
		title: 'Permintaan spec yang sudah ditangani webmcpx',
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

	faq: {
		kicker: 'FAQ',
		title: 'Pertanyaan seputar WebMCP',
		items: {
			what: {
				q: 'Apa itu WebMCP?',
				a: 'API browser yang drafnya disusun di W3C Web Machine Learning Community Group: halaman mendaftarkan tool dengan document.modelContext.registerTool(), lalu agen AI memanggilnya alih-alih membaca screenshot atau HTML halaman. Tool berjalan di tab milik pengguna sendiri.'
			},
			site: {
				q: 'Bagaimana membuat situs saya siap agent?',
				a: 'Tambahkan tag script webmcpx: setiap halaman langsung mendapat tool standar (pencarian, membaca, konteks halaman) tanpa kode lain. Lalu daftarkan aksi Anda sendiri, seperti pencarian atau tambah ke keranjang, dengan tool(). Scan situs Anda di sini untuk mengeceknya.'
			},
			agent: {
				q: 'Bagaimana memakai WebMCP dari Claude Code atau Codex?',
				a: 'Jalankan claude mcp add webmcpx -- npx -y webmcpx mcp (Codex: codex mcp add webmcpx -- npx -y webmcpx mcp). Setelah itu agen Anda membuka halaman di Chromium-nya sendiri dan mendapat tool WebMCP setiap halaman plus tool standar, di situs mana pun.'
			},
			browsers: {
				q: 'Apakah bisa di Firefox dan Safari?',
				a: 'Bisa. Jika browser belum punya WebMCP sendiri, webmcpx memuat polyfill WebMCP dari W3C di halaman HTTPS. Chrome, Firefox, dan Safari melihat tool yang sama.'
			},
			standard: {
				q: 'Apakah WebMCP standar W3C?',
				a: 'Belum. WebMCP adalah draf dari W3C Web Machine Learning Community Group (2 November 2026). Chrome dan Edge menjalankannya lewat origin trial, Mozilla bersikap netral, dan WebKit punya keberatan. webmcpx mengikuti draf itu dan memuat polyfill W3C, jadi tool Anda berfungsi sekarang dan ikut berubah bersama spesifikasinya.'
			},
			safe: {
				q: 'Amankah membiarkan agen memanggil tool di situs saya?',
				a: 'Tool berjalan di tab milik pengguna sendiri, dengan izin pengguna itu sendiri, dan tidak bisa melakukan apa pun yang memang tidak bisa dilakukan halaman. Tool standar webmcpx hanya membaca apa yang ditampilkan halaman, dengan karakter tak terlihat dibuang. Tandai tool Anda yang mengubah sesuatu dengan consequentialHint agar agen bisa bertanya dulu kepada pengguna, dan biarkan linter menandai instruksi tersembunyi di deskripsi tool.'
			},
			mcp: {
				q: 'Apakah WebMCP sama dengan MCP?',
				a: 'Tidak. WebMCP meminjam model tool dari MCP, tetapi ia adalah API browser, bukan protokol MCP: tool-nya ada di halaman dan berjalan di tab pengguna. Keduanya saling melengkapi, dan server MCP webmcpx menghubungkan keduanya.'
			}
		}
	},

	scan: {
		form: 'Scan situs',
		address: 'Alamat situs Anda',
		placeholder: 'situsanda.com',
		submit: 'Scan situs saya',
		scanning: 'Sedang scan…',
		steps: [
			'Membuka halaman…',
			'Mencari tool WebMCP…',
			'Membaca seperti agent…',
			'Memeriksa tool dengan linter…'
		],
		verdicts: { ready: 'Siap agent', issues: 'Hampir', missing: 'Belum siap agent' },
		failed: 'Situs itu tidak bisa di-scan.',
		result: {
			missing:
				'Tidak ada tool WebMCP. Sebagai gantinya, agent harus membaca sekitar {tokens} dari halaman ini.',
			tokens: { other: '{n} token' },
			issues: {
				other: '{tools}, tetapi ada {n} error lint yang akan menjegal agent.'
			},
			toolCount: { other: '{n} tool' },
			basics: '{tools} dan tanpa error lint, tetapi beberapa dasar untuk agent masih kurang.',
			cache: {
				label: 'Hasil dari cache.',
				expires: 'Kedaluwarsa dalam {time}.',
				expired: 'Hasil dari cache ini sudah kedaluwarsa.',
				rescan: 'Scan lagi'
			},
			score: {
				title: 'Skor siap agent',
				of: '{score}/100',
				need: 'Siap agent mulai {min}, dengan tool WebMCP dan tanpa error lint.',
				groups: {
					webmcp: 'WebMCP',
					cost: 'Biaya agent',
					readable: 'Mudah dibaca',
					discoverable: 'Mudah ditemukan'
				},
				items: {
					tools: {
						label: 'Tool WebMCP',
						fix: 'Tambahkan satu tag script: setiap halaman mendapat pencarian, pembacaan, dan konteks halaman.'
					},
					lint: {
						label: 'Tanpa error lint',
						fix: 'Perbaiki temuan di bawah (npx webmcpx lint menemukannya di kode sumber Anda).'
					},
					descriptions: {
						label: 'Semua tool berdeskripsi',
						fix: 'Beri setiap tool deskripsi yang bisa ditindaklanjuti agent.'
					},
					annotations: {
						label: 'Semua tool beranotasi',
						fix: 'Tandai setiap tool dengan readOnlyHint, atau consequentialHint jika ia mengubah sesuatu.'
					},
					cost: {
						label: 'Hemat untuk agent',
						fix: 'Agent membaca seluruh halaman: dengan tool, mereka cukup meminta yang dibutuhkan.',
						read: 'Sekitar {tokens} untuk membaca halaman ini.',
						tools: 'Agent memanggil tool-nya alih-alih membaca halaman.'
					},
					llms_txt: {
						label: 'llms.txt',
						fix: 'Terbitkan /llms.txt: apa situs Anda dan di mana agent menemukan sisanya.'
					},
					markdown: {
						label: 'Versi Markdown',
						fix: 'Sajikan halaman sebagai Markdown (Accept: text/markdown) atau tautkan versinya dengan rel="alternate".'
					},
					robots: {
						label: 'Terbuka untuk agent AI',
						fix: 'robots.txt Anda menutup akses agent AI (Disallow: / untuk mereka).'
					},
					sitemap: {
						label: 'Sitemap',
						fix: 'Terbitkan /sitemap.xml, atau baris Sitemap: di robots.txt.'
					},
					link_headers: {
						label: 'Header Link',
						fix: 'Tambahkan header respons Link yang mengarahkan agent ke llms.txt dan dokumentasi Anda (RFC 8288).'
					},
					agent_skills: {
						label: 'Indeks Agent Skills',
						fix: 'Terbitkan /.well-known/agent-skills/index.json.'
					},
					api_catalog: {
						label: 'Katalog API',
						fix: 'Daftarkan API Anda di /.well-known/api-catalog (RFC 9727).'
					}
				}
			},
			ready: {
				other: '{n} tool yang bisa langsung dipanggil agent. Mantap.'
			},
			readySelf: {
				other: '{n} tool yang bisa langsung dipanggil agent. Masa pembuatnya sendiri belum.'
			},
			tools: 'Tool yang ditemukan',
			more: '+{n} lainnya',
			findings: 'Temuan lint',
			fix: 'Perbaiki WebMCP',
			lint: 'Temukan semua masalah di source Anda, lengkap dengan perbaikannya:',
			terminal: 'terminal',
			// No WebMCP tools: a prompt for the site's coding agent (also in the PDF). {host} is the scanned host,
			// {tag} the script tag and {rescan} the re-scan link, both literal; keep URLs and commands as written.
			agentFix: {
				title: 'Prompt untuk coding agent Anda',
				intro:
					'Belum ada tool WebMCP di sini. Tempel ini ke Claude Code, Codex, atau Cursor di repositori situs:',
				prompt:
					'Tambahkan tool WebMCP ke {host}: baca https://webmcpx.dev/llms.txt, lalu tambahkan {tag} ke layout bersama. Cek dengan npx webmcpx tools <URL lokal>; setelah deploy, pindai ulang di {rescan}.',
				note: 'Ini menambahkan tool WebMCP; pemeriksaan lain di atas menentukan verdiknya.'
			},
			badge: 'Situs Anda meraih badge agent-ready',
			badgeNote:
				'SVG-nya ada di dalam kode, jadi tidak ada yang dimuat dari server kami. Badge ini menautkan ke scan langsung situs Anda, jadi siapa pun bisa mengeceknya.',
			badgeStyle: 'Gaya badge',
			badgeHtml: 'HTML',
			badgeMarkdown: 'Atau Markdown',
			toolsTitle: 'Tool WebMCP di halaman ini',
			badgeTitle: 'Siap agent: cek langsung dengan webmcpx',
			share: 'Bagikan',
			shared: 'Tautan disalin',
			save: 'Simpan PDF',
			savePng: 'Simpan PNG',
			printed: 'Dipindai oleh webmcpx.dev pada {date}. Pindai lagi: {link}'
		},
		badges: {
			card: { name: 'Kartu', fits: 'Halaman terang' },
			flat: { name: 'Datar', fits: 'Footer' },
			dark: { name: 'Gelap', fits: 'Halaman gelap' }
		},
		errors: {
			invalid: 'Ketik situs seperti notion.com atau https://example.com/docs.',
			offline: 'Scanner sedang offline. Jalankan secara lokal dengan `just serve`.',
			noScanner: 'Salinan situs ini tidak punya scanner. Jalankan secara lokal dengan `just serve`.',
			busy: 'Scanner sedang sibuk. Coba lagi dalam {s} detik.',
			busyLater: 'Scanner sedang sibuk. Coba lagi dalam satu menit.',
			running: 'Scan Anda sebelumnya masih berjalan. Tunggu sampai selesai, lalu scan lagi.',
			timeout: 'Halaman terlalu lama merespons.',
			badAddress: 'Alamat itu tidak bisa di-scan.',
			unreadable: 'Halaman tidak bisa dibaca.',
			withDetail: '{lead} ({detail})',
			other: 'Scan gagal ({status}).'
		}
	},

	brand: {
		kicker: 'Panduan merek · sistem desain',
		title: 'Kertas, tinta, dan satu titik temu',
		lead: 'Halaman mendeklarasikan tool-nya; browser berada di antaranya; halaman dan agent bertemu tanpa saling menggantikan. Logo ini menggambarkan pertemuan itu. Semua yang ada di bawah dirender dari kode yang benar-benar dirilis.',
		name: {
			kicker: '01 · Nama',
			title: 'webmcpx, selalu huruf kecil',
			rules: [
				'Selalu huruf kecil: webmcpx, juga di awal kalimat (lebih baik susun ulang kalimatnya).',
				'Di kode dan perintah, tulis dengan Geist Mono.',
				'WebMCP adalah API browser, ditulis sesuai ejaan di draf.',
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
			title: 'Pakai namanya dengan bebas. Jangan terkesan resmi',
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
		code: 'Kode {title}',
		prompt: 'prompt',
		terminal: 'terminal'
	}
};

export default id;
