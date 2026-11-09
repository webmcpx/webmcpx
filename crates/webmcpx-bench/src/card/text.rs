//! The share card's words in each site language (`site/src/lib/i18n/locales.ts`), so a card saved or
//! shared from `/pt-br/` reads in Portuguese. Phrasing follows each language's site dictionary
//! (`site/src/lib/i18n/dict/<code>.ts`, `scan.result`), shortened to fit the card.

/// A plural form, by the CLDR rule of the language.
#[derive(Clone, Copy)]
enum Rule {
    /// 1 is singular (English, Spanish, German, Indonesian has one form anyway).
    One,
    /// 0 and 1 are singular (Portuguese, French, Hindi, Bengali).
    ZeroOne,
    /// Russian: 1, 21 (one); 2-4, 22-24 (few); everything else (many).
    Slavic,
}

/// `{n}` forms: one, few (Russian only; otherwise as `many`) and many.
struct Forms {
    one: &'static str,
    few: &'static str,
    many: &'static str,
}

pub struct Text {
    /// The site's locale code (`en`, `pt-br`, ...).
    pub code: &'static str,
    /// `<html lang>`: picks the right CJK glyphs.
    pub tag: &'static str,
    /// Stamp labels (and the shared link's title), by verdict: ready, almost, missing.
    pub ready: &'static str,
    pub almost: &'static str,
    pub missing: &'static str,
    /// The label over the big score.
    pub score: &'static str,
    /// The call to action under the score; `{site}` is the highlighted `webmcpx.dev`.
    pub cta: &'static str,
    /// `{date}` is the scan date.
    pub scanned: &'static str,
    /// `{d}`, `{m}` (a name from `months`) and `{y}`.
    date: &'static str,
    months: [&'static str; 12],
    rule: Rule,
    /// `{n}` WebMCP tools.
    tools: Forms,
    /// No tools, on a page agents read a lot of: `{n}` is its token count, shown short (12k).
    pub no_tools: &'static str,
    /// No tools, on a light page (its token count says little).
    pub no_tools_light: &'static str,
    /// No tools: what tools gave agents in the benchmark; `{best}` is its best case (62×), always "up to".
    pub hook: &'static str,
    /// Almost: `{n}` points short of agent-ready.
    distance: Forms,
    /// `{tools}` is the tool count (`tools`).
    pub lint: &'static str,
    pub basics: &'static str,
    pub callable: &'static str,
    /// After the line in a link's description: `{score}`.
    pub score_line: &'static str,
}

impl Text {
    /// The language for a site locale code; English for anything else.
    pub fn of(code: Option<&str>) -> &'static Self {
        let code = code.unwrap_or_default().to_ascii_lowercase();
        ALL.iter().find(|t| t.code == code).unwrap_or(&ALL[0])
    }

    /// `n` WebMCP tools, in this language's plural form.
    pub fn tools(&self, n: usize) -> String {
        self.pick(&self.tools, n).replace("{n}", &n.to_string())
    }

    /// `n` points short of agent-ready.
    pub fn distance(&self, n: usize) -> String {
        self.pick(&self.distance, n).replace("{n}", &n.to_string())
    }

    /// The form of `forms` for `n`.
    fn pick(&self, forms: &Forms, n: usize) -> &'static str {
        match self.rule {
            Rule::One if n == 1 => forms.one,
            Rule::ZeroOne if n <= 1 => forms.one,
            Rule::Slavic if n % 10 == 1 && n % 100 != 11 => forms.one,
            Rule::Slavic if (2..=4).contains(&(n % 10)) && !(12..=14).contains(&(n % 100)) => {
                forms.few
            }
            _ => forms.many,
        }
    }

    /// `2026-11-09` in this language (`Nov 9, 2026`, `9 de nov. de 2026`, `2026年11月9日`); anything
    /// else as given.
    pub fn date(&self, iso: &str) -> String {
        let mut parts = iso.splitn(3, '-').map(str::parse::<usize>);
        match (parts.next(), parts.next(), parts.next()) {
            (Some(Ok(y)), Some(Ok(m @ 1..=12)), Some(Ok(d))) => self
                .date
                .replace("{d}", &d.to_string())
                .replace("{m}", self.months[m - 1])
                .replace("{y}", &y.to_string()),
            _ => iso.to_owned(),
        }
    }
}

const NUMBERED: [&str; 12] = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];

/// Every site language; English first (the fallback).
pub const ALL: [Text; 11] = [
    Text {
        code: "en",
        tag: "en",
        ready: "Agent-ready",
        almost: "Almost agent-ready",
        missing: "Not agent-ready",
        score: "Agent-ready score",
        cta: "Is your site agent-ready? {site}",
        scanned: "Scanned {date}",
        date: "{m} {d}, {y}",
        months: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
        rule: Rule::One,
        tools: Forms {
            one: "{n} WebMCP tool",
            few: "{n} WebMCP tools",
            many: "{n} WebMCP tools",
        },
        no_tools: "No WebMCP tools: agents read ~{n} tokens of this page instead.",
        no_tools_light: "No WebMCP tools for agents to call.",
        hook: "With WebMCP: up to {best} fewer tokens in our benchmark.",
        distance: Forms {
            one: "{n} point to agent-ready.",
            few: "{n} points to agent-ready.",
            many: "{n} points to agent-ready.",
        },
        lint: "{tools}, with lint errors agents will trip on.",
        basics: "{tools}; a few agent basics missing.",
        callable: "{tools} agents can call directly.",
        score_line: "Score {score}/100.",
    },
    Text {
        code: "zh",
        tag: "zh-Hans",
        ready: "智能体就绪",
        almost: "差一点就绪",
        missing: "智能体未就绪",
        score: "智能体就绪评分",
        cta: "你的网站呢？{site}",
        scanned: "扫描于 {date}",
        date: "{y}年{m}月{d}日",
        months: NUMBERED,
        rule: Rule::One,
        tools: Forms {
            one: "{n} 个 WebMCP 工具",
            few: "{n} 个 WebMCP 工具",
            many: "{n} 个 WebMCP 工具",
        },
        no_tools: "没有 WebMCP 工具：智能体只能读这个页面约 {n} 个 token。",
        no_tools_light: "没有可供智能体调用的 WebMCP 工具。",
        hook: "用上 WebMCP：在我们的基准测试中最多少用 {best} 的 token。",
        distance: Forms {
            one: "距离智能体就绪还差 {n} 分。",
            few: "距离智能体就绪还差 {n} 分。",
            many: "距离智能体就绪还差 {n} 分。",
        },
        lint: "{tools}，但有会让智能体出错的 lint 错误。",
        basics: "{tools}，但还缺几项面向智能体的基础配置。",
        callable: "智能体可直接调用的 {tools}。",
        score_line: "评分 {score}/100。",
    },
    Text {
        code: "hi",
        tag: "hi",
        ready: "एजेंट-रेडी",
        almost: "लगभग एजेंट-रेडी",
        missing: "एजेंट-रेडी नहीं",
        score: "एजेंट-रेडी स्कोर",
        cta: "और आपकी साइट? {site}",
        scanned: "स्कैन: {date}",
        date: "{d} {m} {y}",
        months: [
            "जन॰",
            "फ़र॰",
            "मार्च",
            "अप्रैल",
            "मई",
            "जून",
            "जुल॰",
            "अग॰",
            "सित॰",
            "अक्तू॰",
            "नव॰",
            "दिस॰",
        ],
        rule: Rule::ZeroOne,
        tools: Forms {
            one: "{n} WebMCP टूल",
            few: "{n} WebMCP टूल्स",
            many: "{n} WebMCP टूल्स",
        },
        no_tools: "कोई WebMCP टूल नहीं: एजेंट को इस पेज के ~{n} टोकन पढ़ने पड़ते हैं।",
        no_tools_light: "एजेंट के कॉल करने लायक कोई WebMCP टूल नहीं।",
        hook: "WebMCP के साथ: हमारे बेंचमार्क में {best} तक कम टोकन।",
        distance: Forms {
            one: "एजेंट-रेडी होने में बस {n} अंक बाकी।",
            few: "एजेंट-रेडी होने में बस {n} अंक बाकी।",
            many: "एजेंट-रेडी होने में बस {n} अंक बाकी।",
        },
        lint: "{tools}, लेकिन लिंट एरर के साथ, जिन पर एजेंट अटकेंगे।",
        basics: "{tools}; एजेंट के लिए कुछ बुनियादी चीज़ें गायब हैं।",
        callable: "{tools}, जिन्हें एजेंट सीधे कॉल कर सकते हैं।",
        score_line: "स्कोर {score}/100।",
    },
    Text {
        code: "es",
        tag: "es",
        ready: "Listo para agentes",
        almost: "Casi listo para agentes",
        missing: "No listo para agentes",
        score: "Puntuación para agentes",
        cta: "¿Y tu sitio? {site}",
        scanned: "Escaneado el {date}",
        date: "{d} {m} {y}",
        months: [
            "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic",
        ],
        rule: Rule::One,
        tools: Forms {
            one: "{n} herramienta WebMCP",
            few: "{n} herramientas WebMCP",
            many: "{n} herramientas WebMCP",
        },
        no_tools: "Sin herramientas WebMCP: los agentes leen ~{n} tokens de esta página.",
        no_tools_light: "Sin herramientas WebMCP que los agentes puedan llamar.",
        hook: "Con WebMCP: hasta {best} menos tokens en nuestro benchmark.",
        distance: Forms {
            one: "Falta {n} punto para estar listo para agentes.",
            few: "Faltan {n} puntos para estar listo para agentes.",
            many: "Faltan {n} puntos para estar listo para agentes.",
        },
        lint: "{tools}, con errores de lint con los que tropezarán los agentes.",
        basics: "{tools}; faltan algunos básicos para agentes.",
        callable: "{tools} que los agentes llaman directamente.",
        score_line: "Puntuación {score}/100.",
    },
    Text {
        code: "fr",
        tag: "fr",
        ready: "Prêt pour les agents",
        almost: "Presque prêt pour les agents",
        missing: "Pas prêt pour les agents",
        score: "Score agent-ready",
        cta: "Et votre site\u{a0}? {site}",
        scanned: "Scanné le {date}",
        date: "{d} {m} {y}",
        months: [
            "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.",
            "nov.", "déc.",
        ],
        rule: Rule::ZeroOne,
        tools: Forms {
            one: "{n} outil WebMCP",
            few: "{n} outils WebMCP",
            many: "{n} outils WebMCP",
        },
        no_tools: "Aucun outil WebMCP\u{a0}: les agents lisent ~{n} tokens de cette page.",
        no_tools_light: "Aucun outil WebMCP que les agents peuvent appeler.",
        hook: "Avec WebMCP\u{a0}: jusqu’à {best} moins de tokens dans notre benchmark.",
        distance: Forms {
            one: "Plus que {n} point avant d’être prêt pour les agents.",
            few: "Plus que {n} points avant d’être prêt pour les agents.",
            many: "Plus que {n} points avant d’être prêt pour les agents.",
        },
        lint: "{tools}, avec des erreurs de lint sur lesquelles les agents vont buter.",
        basics: "{tools}\u{a0}; il manque quelques bases pour les agents.",
        callable: "{tools} que les agents appellent directement.",
        score_line: "Score {score}/100.",
    },
    Text {
        code: "bn",
        tag: "bn",
        ready: "এজেন্ট-রেডি",
        almost: "প্রায় এজেন্ট-রেডি",
        missing: "এজেন্ট-রেডি নয়",
        score: "এজেন্ট-রেডি স্কোর",
        cta: "আর আপনার সাইট? {site}",
        scanned: "স্ক্যান: {date}",
        date: "{d} {m}, {y}",
        months: [
            "জানু",
            "ফেব",
            "মার্চ",
            "এপ্রি",
            "মে",
            "জুন",
            "জুল",
            "আগ",
            "সেপ",
            "অক্টো",
            "নভে",
            "ডিসে",
        ],
        rule: Rule::ZeroOne,
        tools: Forms {
            one: "{n}টি WebMCP টুল",
            few: "{n}টি WebMCP টুল",
            many: "{n}টি WebMCP টুল",
        },
        no_tools: "কোনো WebMCP টুল নেই: এজেন্টকে এই পেজের ~{n} টোকেন পড়তে হয়।",
        no_tools_light: "এজেন্ট কল করতে পারে এমন কোনো WebMCP টুল নেই।",
        hook: "WebMCP দিয়ে: আমাদের বেঞ্চমার্কে {best} পর্যন্ত কম টোকেন।",
        distance: Forms {
            one: "এজেন্ট-রেডি হতে আর {n} পয়েন্ট বাকি।",
            few: "এজেন্ট-রেডি হতে আর {n} পয়েন্ট বাকি।",
            many: "এজেন্ট-রেডি হতে আর {n} পয়েন্ট বাকি।",
        },
        lint: "{tools}, কিন্তু লিন্ট এরর আছে, যাতে এজেন্ট হোঁচট খাবে।",
        basics: "{tools}; এজেন্টের জন্য কয়েকটি মৌলিক জিনিস নেই।",
        callable: "{tools}, যা এজেন্ট সরাসরি কল করতে পারে।",
        score_line: "স্কোর {score}/100।",
    },
    Text {
        code: "pt-br",
        tag: "pt-BR",
        ready: "Pronto para agentes",
        almost: "Quase pronto para agentes",
        missing: "Não pronto para agentes",
        score: "Nota para agentes",
        cta: "E o seu site? {site}",
        scanned: "Escaneado em {date}",
        date: "{d} de {m} de {y}",
        months: [
            "jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.",
            "dez.",
        ],
        rule: Rule::ZeroOne,
        tools: Forms {
            one: "{n} ferramenta WebMCP",
            few: "{n} ferramentas WebMCP",
            many: "{n} ferramentas WebMCP",
        },
        no_tools: "Nenhuma ferramenta WebMCP: os agentes leem ~{n} tokens desta página.",
        no_tools_light: "Nenhuma ferramenta WebMCP para os agentes chamarem.",
        hook: "Com WebMCP: até {best} menos tokens no nosso benchmark.",
        distance: Forms {
            one: "Falta {n} ponto para ficar pronto para agentes.",
            few: "Faltam {n} pontos para ficar pronto para agentes.",
            many: "Faltam {n} pontos para ficar pronto para agentes.",
        },
        lint: "{tools}, com erros de lint em que os agentes vão tropeçar.",
        basics: "{tools}; faltam alguns básicos para agentes.",
        callable: "{tools} que os agentes chamam direto.",
        score_line: "Nota {score}/100.",
    },
    Text {
        code: "ru",
        tag: "ru",
        ready: "Готов к агентам",
        almost: "Почти готов к агентам",
        missing: "Не готов к агентам",
        score: "Готовность к агентам",
        cta: "А ваш сайт? {site}",
        scanned: "Проверено {date}",
        date: "{d} {m} {y} г.",
        months: [
            "янв.",
            "февр.",
            "мар.",
            "апр.",
            "мая",
            "июн.",
            "июл.",
            "авг.",
            "сент.",
            "окт.",
            "нояб.",
            "дек.",
        ],
        rule: Rule::Slavic,
        tools: Forms {
            one: "{n} инструмент WebMCP",
            few: "{n} инструмента WebMCP",
            many: "{n} инструментов WebMCP",
        },
        no_tools: "Инструментов WebMCP нет: агенты читают около {n} токенов этой страницы.",
        no_tools_light: "Нет инструментов WebMCP, которые могли бы вызвать агенты.",
        hook: "С WebMCP: до {best} меньше токенов в нашем бенчмарке.",
        distance: Forms {
            one: "До готовности к агентам: {n} балл.",
            few: "До готовности к агентам: {n} балла.",
            many: "До готовности к агентам: {n} баллов.",
        },
        lint: "{tools}, но с ошибками линтера, на которых споткнутся агенты.",
        basics: "{tools}; кое-каких основ для агентов не хватает.",
        callable: "{tools} для прямого вызова агентами.",
        score_line: "Оценка {score}/100.",
    },
    Text {
        code: "id",
        tag: "id",
        ready: "Siap agent",
        almost: "Hampir siap agent",
        missing: "Belum siap agent",
        score: "Skor siap agent",
        cta: "Situsmu bagaimana? {site}",
        scanned: "Dipindai {date}",
        date: "{d} {m} {y}",
        months: [
            "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
        ],
        rule: Rule::One,
        tools: Forms {
            one: "{n} tool WebMCP",
            few: "{n} tool WebMCP",
            many: "{n} tool WebMCP",
        },
        no_tools: "Tidak ada tool WebMCP: agent membaca ~{n} token halaman ini.",
        no_tools_light: "Tidak ada tool WebMCP yang bisa dipanggil agent.",
        hook: "Dengan WebMCP: hingga {best} lebih sedikit token di benchmark kami.",
        distance: Forms {
            one: "Tinggal {n} poin lagi menuju siap agent.",
            few: "Tinggal {n} poin lagi menuju siap agent.",
            many: "Tinggal {n} poin lagi menuju siap agent.",
        },
        lint: "{tools}, tetapi ada error lint yang akan menjegal agent.",
        basics: "{tools}; beberapa dasar untuk agent masih kurang.",
        callable: "{tools} yang bisa dipanggil agent langsung.",
        score_line: "Skor {score}/100.",
    },
    Text {
        code: "de",
        tag: "de",
        ready: "Agentenfähig",
        almost: "Fast agentenfähig",
        missing: "Nicht agentenfähig",
        score: "Agenten-Score",
        cta: "Und deine Seite? {site}",
        scanned: "Gescannt am {date}",
        date: "{d}. {m} {y}",
        months: [
            "Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.",
            "Dez.",
        ],
        rule: Rule::One,
        tools: Forms {
            one: "{n} WebMCP-Tool",
            few: "{n} WebMCP-Tools",
            many: "{n} WebMCP-Tools",
        },
        no_tools: "Keine WebMCP-Tools: Agenten lesen ~{n} Tokens dieser Seite.",
        no_tools_light: "Keine WebMCP-Tools, die Agenten aufrufen können.",
        hook: "Mit WebMCP: bis zu {best} weniger Tokens in unserem Benchmark.",
        distance: Forms {
            one: "Noch {n} Punkt bis agentenfähig.",
            few: "Noch {n} Punkte bis agentenfähig.",
            many: "Noch {n} Punkte bis agentenfähig.",
        },
        lint: "{tools}, mit Lint-Fehlern, über die Agenten stolpern.",
        basics: "{tools}; ein paar Grundlagen für Agenten fehlen.",
        callable: "{tools}, die Agenten direkt aufrufen.",
        score_line: "Score {score}/100.",
    },
    Text {
        code: "ja",
        tag: "ja",
        ready: "エージェント対応",
        almost: "エージェント対応まであと少し",
        missing: "エージェント未対応",
        score: "エージェント対応スコア",
        cta: "あなたのサイトは？ {site}",
        scanned: "{date} にスキャン",
        date: "{y}年{m}月{d}日",
        months: NUMBERED,
        rule: Rule::One,
        tools: Forms {
            one: "{n} 個の WebMCP ツール",
            few: "{n} 個の WebMCP ツール",
            many: "{n} 個の WebMCP ツール",
        },
        no_tools: "WebMCP ツールなし。エージェントはこのページの約 {n} トークンを読みます。",
        no_tools_light: "エージェントが呼び出せる WebMCP ツールがありません。",
        hook: "WebMCP なら、私たちのベンチマークでトークンが最大{best}削減。",
        distance: Forms {
            one: "エージェント対応まであと {n} ポイント。",
            few: "エージェント対応まであと {n} ポイント。",
            many: "エージェント対応まであと {n} ポイント。",
        },
        lint: "{tools}。ただしエージェントがつまずく lint エラーがあります。",
        basics: "{tools}。エージェント向けの基本がいくつか足りません。",
        callable: "エージェントが直接呼び出せる {tools}。",
        score_line: "スコア {score}/100。",
    },
];

#[cfg(test)]
mod tests {
    use super::*;

    /// Every site language has card words, and nothing else does.
    #[test]
    fn one_text_per_site_language() {
        let locales = include_str!("../../../../site/src/lib/i18n/locales.ts");
        let codes = locales
            .lines()
            .find(|l| l.starts_with("export const LOCALE_CODES"))
            .expect("LOCALE_CODES");
        let mut site: Vec<&str> = codes.split('\'').skip(1).step_by(2).collect();
        let mut ours: Vec<&str> = ALL.iter().map(|t| t.code).collect();
        site.sort_unstable();
        ours.sort_unstable();
        assert_eq!(site, ours);
    }

    #[test]
    fn languages_dates_and_plurals() {
        assert_eq!(Text::of(None).code, "en");
        assert_eq!(Text::of(Some("PT-BR")).code, "pt-br");
        assert_eq!(Text::of(Some("xx")).code, "en");
        let ru = Text::of(Some("ru"));
        assert_eq!(ru.tools(1), "1 инструмент WebMCP");
        assert_eq!(ru.tools(3), "3 инструмента WebMCP");
        assert_eq!(ru.tools(11), "11 инструментов WebMCP");
        assert_eq!(ru.tools(22), "22 инструмента WebMCP");
        assert_eq!(Text::of(Some("en")).tools(1), "1 WebMCP tool");
        assert_eq!(Text::of(Some("en")).tools(2), "2 WebMCP tools");
        assert_eq!(Text::of(Some("en")).date("2026-11-09"), "Nov 9, 2026");
        assert_eq!(
            Text::of(Some("pt-br")).date("2026-11-09"),
            "9 de nov. de 2026"
        );
        assert_eq!(Text::of(Some("ja")).date("2026-01-31"), "2026年1月31日");
        assert_eq!(Text::of(Some("de")).date("soon"), "soon");
        assert_eq!(Text::of(None).distance(1), "1 point to agent-ready.");
        assert_eq!(
            Text::of(Some("pt-br")).distance(5),
            "Faltam 5 pontos para ficar pronto para agentes."
        );
        assert_eq!(ru.distance(5), "До готовности к агентам: 5 баллов.");
    }
}
