import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const schoolId = '00000000-0000-0000-0000-000000000001'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------- Course ----------

const courseId = randomUUID()

const course = {
  id: courseId,
  school_id: schoolId,
  title: 'Español A0-A1: Іспанська з нуля',
  description:
    'Повний курс іспанської мови для початківців. Від алфавіту та привітань до базових діалогів у подорожах, ресторанах та повсякденному житті. Рівень A0-A1 за шкалою CEFR.',
  is_published: true,
  cover_url: null,
  // created_by will be set dynamically
  created_by: '',
}

// ---------- Lessons & blocks ----------

interface FlashcardItem {
  front: string
  back: string
  transcription?: string
}

interface QuizQuestion {
  text: string
  options: string[]
  correct_index: number
  explanation?: string
}

interface LessonSeed {
  title: string
  blocks: BlockSeed[]
}

type BlockSeed =
  | { type: 'text'; content: { html: string } }
  | { type: 'flashcards'; content: { cards: FlashcardItem[] } }
  | { type: 'quiz'; content: { questions: QuizQuestion[] } }
  | { type: 'video'; content: { url: string; title?: string } }

function cards(items: FlashcardItem[]): BlockSeed {
  return {
    type: 'flashcards',
    content: {
      cards: items.map((c) => ({ ...c, id: randomUUID() })),
    },
  }
}

function quiz(questions: QuizQuestion[]): BlockSeed {
  return {
    type: 'quiz',
    content: {
      questions: questions.map((q) => ({ ...q, id: randomUUID() })),
    },
  }
}

function text(html: string): BlockSeed {
  return { type: 'text', content: { html } }
}

function video(url: string, title?: string): BlockSeed {
  return { type: 'video', content: { url, title } }
}

// ---------- Lessons data ----------

const lessons: LessonSeed[] = [
  // ===== Lesson 1 =====
  {
    title: '1. Привітання та знайомство',
    blocks: [
      text(`
<h2>Saludos y presentaciones</h2>
<p>В іспанській мові існують формальні та неформальні привітання. На рівні A0 важливо запам'ятати базові фрази, які ви будете використовувати щодня.</p>
<h3>Неформальні привітання</h3>
<ul>
  <li><strong>¡Hola!</strong> — Привіт!</li>
  <li><strong>¿Qué tal?</strong> — Як справи?</li>
  <li><strong>¿Cómo estás?</strong> — Як ти?</li>
  <li><strong>¡Buenos días!</strong> — Доброго ранку!</li>
  <li><strong>¡Buenas tardes!</strong> — Доброго дня!</li>
  <li><strong>¡Buenas noches!</strong> — Доброго вечора / На добраніч!</li>
</ul>
<h3>Формальні привітання</h3>
<ul>
  <li><strong>¿Cómo está usted?</strong> — Як Ви? (формально)</li>
  <li><strong>Mucho gusto.</strong> — Дуже приємно.</li>
  <li><strong>Encantado/a.</strong> — Радий/рада знайомству.</li>
</ul>
<h3>Знайомство</h3>
<p>Щоб представитися, використовуйте такі конструкції:</p>
<ul>
  <li><strong>Me llamo…</strong> — Мене звати…</li>
  <li><strong>Soy…</strong> — Я (є)…</li>
  <li><strong>Soy de Ucrania.</strong> — Я з України.</li>
  <li><strong>¿Cómo te llamas?</strong> — Як тебе звати?</li>
  <li><strong>¿De dónde eres?</strong> — Звідки ти?</li>
</ul>
      `),
      cards([
        { front: '¡Hola!', back: 'Привіт!', transcription: '[о́ла]' },
        { front: '¿Qué tal?', back: 'Як справи?', transcription: '[ке таль]' },
        { front: '¡Buenos días!', back: 'Доброго ранку!', transcription: '[буе́нос ді́ас]' },
        { front: '¡Buenas tardes!', back: 'Доброго дня!', transcription: '[буе́нас та́рдес]' },
        { front: '¡Buenas noches!', back: 'Доброго вечора!', transcription: '[буе́нас но́чес]' },
        { front: 'Me llamo…', back: 'Мене звати…', transcription: '[ме я́мо]' },
        { front: '¿Cómo te llamas?', back: 'Як тебе звати?', transcription: '[ко́мо те я́мас]' },
        { front: 'Mucho gusto.', back: 'Дуже приємно.', transcription: '[му́чо гу́сто]' },
        { front: 'Soy de Ucrania.', back: 'Я з України.', transcription: '[сой де укра́ніа]' },
        { front: '¿De dónde eres?', back: 'Звідки ти?', transcription: '[де до́нде е́рес]' },
        { front: '¡Adiós!', back: 'До побачення!', transcription: '[адьо́с]' },
        { front: '¡Hasta luego!', back: 'До зустрічі!', transcription: '[а́ста лує́ґо]' },
      ]),
      quiz([
        {
          text: 'Як перекладається "¡Hola!" українською?',
          options: ['Привіт!', 'До побачення!', 'Дякую!', 'Вибачте!'],
          correct_index: 0,
          explanation: '¡Hola! — це найпоширеніше неформальне привітання в іспанській мові.',
        },
        {
          text: 'Яка фраза означає "Як тебе звати?"?',
          options: ['¿De dónde eres?', '¿Cómo te llamas?', '¿Qué tal?', '¿Cómo estás?'],
          correct_index: 1,
          explanation: '¿Cómo te llamas? дослівно — "Як ти називаєшся?"',
        },
        {
          text: 'Оберіть правильний переклад: "Я з України"',
          options: ['Soy Ucrania.', 'Estoy de Ucrania.', 'Soy de Ucrania.', 'Me llamo Ucrania.'],
          correct_index: 2,
          explanation: 'Для вказівки походження використовується конструкція "Soy de + країна".',
        },
        {
          text: 'Що означає "Mucho gusto"?',
          options: ['Смачного!', 'Дуже приємно.', 'Дуже добре.', 'Велике дякую.'],
          correct_index: 1,
          explanation:
            '"Mucho gusto" використовують при знайомстві, це означає "Дуже приємно (познайомитися)".',
        },
        {
          text: 'Яке привітання доречне ввечері?',
          options: ['¡Buenos días!', '¡Buenas tardes!', '¡Buenas noches!', '¡Buen viaje!'],
          correct_index: 2,
          explanation: '¡Buenas noches! використовується ввечері та на прощання перед сном.',
        },
      ]),
    ],
  },

  // ===== Lesson 2 =====
  {
    title: '2. Алфавіт та вимова',
    blocks: [
      text(`
<h2>El alfabeto español</h2>
<p>Іспанський алфавіт складається з 27 літер. Більшість звуків схожі на українські, але є кілька особливостей, на які варто звернути увагу.</p>
<h3>Ключові відмінності від української</h3>
<table>
  <tr><th>Літера</th><th>Вимова</th><th>Приклад</th></tr>
  <tr><td><strong>H</strong></td><td>Завжди <em>німа</em> (не вимовляється)</td><td>hola [о́ла]</td></tr>
  <tr><td><strong>J</strong></td><td>Як українське <em>х</em></td><td>julio [ху́ліо]</td></tr>
  <tr><td><strong>Ñ</strong></td><td>Як <em>нь</em></td><td>España [еспа́нья]</td></tr>
  <tr><td><strong>LL</strong></td><td>Як <em>й</em> або <em>ль</em></td><td>llamo [я́мо]</td></tr>
  <tr><td><strong>RR</strong></td><td>Розкотисте <em>р</em></td><td>perro [пе́рро]</td></tr>
  <tr><td><strong>Z</strong></td><td>Як англійське <em>th</em> (в Іспанії) або <em>с</em> (в Латинській Америці)</td><td>zapato [θапа́то / сапа́то]</td></tr>
  <tr><td><strong>V</strong></td><td>Вимовляється як <em>б</em></td><td>vino [бі́но]</td></tr>
</table>
<h3>Наголос</h3>
<p>В іспанській мові наголос передбачуваний:</p>
<ol>
  <li>Якщо слово закінчується на голосну, <strong>n</strong> або <strong>s</strong> — наголос на передостанньому складі: <em>ca-sa</em>, <em>ha-blan</em></li>
  <li>Якщо слово закінчується на приголосну (крім n, s) — наголос на останньому складі: <em>ha-blar</em>, <em>ciu-dad</em></li>
  <li>Якщо є знак наголосу (´) — наголос там, де вказано: <em>ca-fé</em>, <em>te-lé-fo-no</em></li>
</ol>
      `),
      video(
        'https://www.youtube.com/watch?v=South0JYXWI',
        'Іспанський алфавіт — вимова всіх літер'
      ),
      cards([
        { front: 'A', back: 'а', transcription: '[а]' },
        { front: 'B', back: 'бе', transcription: '[бе]' },
        { front: 'C', back: 'се', transcription: '[θе / се]' },
        { front: 'D', back: 'де', transcription: '[де]' },
        { front: 'E', back: 'е', transcription: '[е]' },
        { front: 'G', back: 'хе', transcription: '[хе]' },
        { front: 'H', back: 'аче (німа)', transcription: '[а́че]' },
        { front: 'J', back: 'хота', transcription: '[хо́та]' },
        { front: 'Ñ', back: 'енье', transcription: '[е́нье]' },
        { front: 'LL', back: 'елье / подвійне л', transcription: '[е́лье]' },
        { front: 'RR', back: 'ерре (розкотисте р)', transcription: '[е́рре]' },
        { front: 'V', back: 'уве (вимовляється як б)', transcription: '[у́бе]' },
        { front: 'Z', back: 'сета', transcription: '[θе́та / се́та]' },
      ]),
      quiz([
        {
          text: 'Яка літера в іспанській мові завжди німа?',
          options: ['J', 'G', 'H', 'Y'],
          correct_index: 2,
          explanation: 'Літера H ніколи не вимовляється: hola = [о́ла], hospital = [оспіта́ль].',
        },
        {
          text: 'Як вимовляється літера J?',
          options: [
            'Як українське "ж"',
            'Як українське "х"',
            'Як українське "й"',
            'Як українське "дж"',
          ],
          correct_index: 1,
          explanation: 'J вимовляється як "х": Juan [хуа́н], jardín [хардí н].',
        },
        {
          text: 'Де наголос у слові "teléfono"?',
          options: [
            'На першому складі (TE-lé-fo-no)',
            'На другому складі (te-LÉ-fo-no)',
            'На третьому складі (te-lé-FO-no)',
            'На останньому складі (te-lé-fo-NO)',
          ],
          correct_index: 1,
          explanation: 'Знак наголосу (´) завжди вказує на наголошений склад: te-LÉ-fo-no.',
        },
        {
          text: 'Як вимовляється "V" в іспанській?',
          options: [
            'Як українське "в"',
            'Як українське "ф"',
            'Як українське "б"',
            'Не вимовляється',
          ],
          correct_index: 2,
          explanation: 'В іспанській мові V і B вимовляються однаково — як "б".',
        },
      ]),
    ],
  },

  // ===== Lesson 3 =====
  {
    title: '3. Числа від 0 до 100',
    blocks: [
      text(`
<h2>Los números del 0 al 100</h2>
<p>Числа — одна з перших тем, які потрібно вивчити. Вони знадобляться для покупок, телефонних номерів, віку та часу.</p>
<h3>0–15 (потрібно запам'ятати)</h3>
<p>Ці числа мають унікальні форми:</p>
<p><strong>0</strong> cero, <strong>1</strong> uno, <strong>2</strong> dos, <strong>3</strong> tres, <strong>4</strong> cuatro, <strong>5</strong> cinco, <strong>6</strong> seis, <strong>7</strong> siete, <strong>8</strong> ocho, <strong>9</strong> nueve, <strong>10</strong> diez, <strong>11</strong> once, <strong>12</strong> doce, <strong>13</strong> trece, <strong>14</strong> catorce, <strong>15</strong> quince</p>
<h3>16–19 (dieci + число)</h3>
<p><strong>16</strong> dieciséis, <strong>17</strong> diecisiete, <strong>18</strong> dieciocho, <strong>19</strong> diecinueve</p>
<h3>20–29 (veinti + число)</h3>
<p><strong>20</strong> veinte, <strong>21</strong> veintiuno, <strong>22</strong> veintidós, <strong>23</strong> veintitrés…</p>
<h3>30–99 (десятки + y + одиниці)</h3>
<p><strong>30</strong> treinta, <strong>40</strong> cuarenta, <strong>50</strong> cincuenta, <strong>60</strong> sesenta, <strong>70</strong> setenta, <strong>80</strong> ochenta, <strong>90</strong> noventa, <strong>100</strong> cien</p>
<p>Приклад: <strong>47</strong> = cuarenta y siete, <strong>83</strong> = ochenta y tres</p>
      `),
      cards([
        { front: '0 — cero', back: 'нуль', transcription: '[се́ро]' },
        { front: '1 — uno', back: 'один', transcription: '[у́но]' },
        { front: '2 — dos', back: 'два', transcription: '[дос]' },
        { front: '3 — tres', back: 'три', transcription: '[трес]' },
        { front: '5 — cinco', back: "п'ять", transcription: '[сі́нко]' },
        { front: '10 — diez', back: 'десять', transcription: '[дьєс]' },
        { front: '15 — quince', back: "п'ятнадцять", transcription: '[кі́нсе]' },
        { front: '20 — veinte', back: 'двадцять', transcription: '[бе́йнте]' },
        { front: '30 — treinta', back: 'тридцять', transcription: '[тре́йнта]' },
        { front: '50 — cincuenta', back: "п'ятдесят", transcription: '[сінкуе́нта]' },
        { front: '100 — cien', back: 'сто', transcription: '[сьєн]' },
      ]),
      quiz([
        {
          text: 'Як іспанською буде число 17?',
          options: ['Diez y siete', 'Diecisiete', 'Diecesiete', 'Diesisiete'],
          correct_index: 1,
          explanation:
            'Числа 16–19 пишуться одним словом: dieciséis, diecisiete, dieciocho, diecinueve.',
        },
        {
          text: 'Як правильно сказати 43 іспанською?',
          options: ['Cuarenta tres', 'Cuarenta y tres', 'Cuatro y tres', 'Cuarenti tres'],
          correct_index: 1,
          explanation: 'Від 30 до 99 числа утворюються за формулою: десятки + y + одиниці.',
        },
        {
          text: 'Яке число означає "quince"?',
          options: ['5', '50', '15', '14'],
          correct_index: 2,
          explanation: 'Quince = 15. Cinco = 5, cincuenta = 50, catorce = 14.',
        },
        {
          text: 'Як перекладається "ochenta y dos"?',
          options: ['72', '82', '28', '92'],
          correct_index: 1,
          explanation: 'Ochenta = 80, dos = 2 → ochenta y dos = 82.',
        },
      ]),
    ],
  },

  // ===== Lesson 4 =====
  {
    title: '4. Артиклі та рід іменників',
    blocks: [
      text(`
<h2>Los artículos y el género</h2>
<p>В іспанській мові всі іменники мають рід — <strong>чоловічий (masculino)</strong> або <strong>жіночий (femenino)</strong>. Це одна з найважливіших граматичних основ.</p>
<h3>Означені артиклі (артиклі "той/та")</h3>
<table>
  <tr><th></th><th>Однина</th><th>Множина</th></tr>
  <tr><td>Чоловічий</td><td><strong>el</strong> libro (книга)</td><td><strong>los</strong> libros (книги)</td></tr>
  <tr><td>Жіночий</td><td><strong>la</strong> mesa (стіл)</td><td><strong>las</strong> mesas (столи)</td></tr>
</table>
<h3>Неозначені артиклі (артиклі "якийсь")</h3>
<table>
  <tr><th></th><th>Однина</th><th>Множина</th></tr>
  <tr><td>Чоловічий</td><td><strong>un</strong> libro</td><td><strong>unos</strong> libros</td></tr>
  <tr><td>Жіночий</td><td><strong>una</strong> mesa</td><td><strong>unas</strong> mesas</td></tr>
</table>
<h3>Як визначити рід?</h3>
<ul>
  <li>Слова на <strong>-o</strong> зазвичай чоловічого роду: el libro, el gato</li>
  <li>Слова на <strong>-a</strong> зазвичай жіночого роду: la casa, la mesa</li>
  <li>Слова на <strong>-ción, -sión, -dad, -tad</strong> — жіночого: la nación, la ciudad</li>
  <li>Слова на <strong>-ma</strong> (грецького походження) — чоловічого: el problema, el tema</li>
</ul>
<p><strong>Виняток:</strong> el día (день) — чоловічого роду, хоча закінчується на -a.<br/>
<strong>Виняток:</strong> la mano (рука) — жіночого роду, хоча закінчується на -o.</p>
      `),
      cards([
        { front: 'el libro', back: 'книга (чол. р.)', transcription: '[ель лі́бро]' },
        { front: 'la mesa', back: 'стіл (жін. р.)', transcription: '[ла ме́са]' },
        { front: 'el gato', back: 'кіт', transcription: '[ель ґа́то]' },
        { front: 'la casa', back: 'дім, будинок', transcription: '[ла ка́са]' },
        { front: 'el problema', back: 'проблема (чол. р.!)', transcription: '[ель пробле́ма]' },
        { front: 'la mano', back: 'рука (жін. р.!)', transcription: '[ла ма́но]' },
        { front: 'el día', back: 'день (чол. р.!)', transcription: '[ель ді́а]' },
        { front: 'la ciudad', back: 'місто', transcription: '[ла сьюда́д]' },
        { front: 'un / una', back: 'один / одна (неозн. артикль)', transcription: '[ун / у́на]' },
        { front: 'los / las', back: 'означені артиклі множини', transcription: '[лос / лас]' },
      ]),
      quiz([
        {
          text: 'Який артикль правильний: ___ problema?',
          options: ['la', 'el', 'una', 'las'],
          correct_index: 1,
          explanation:
            '"Problema" — виняток: закінчується на -a, але чоловічого роду (грецьке походження).',
        },
        {
          text: 'Який рід має слово "ciudad"?',
          options: ['Чоловічий', 'Жіночий', 'Середній', 'Залежить від контексту'],
          correct_index: 1,
          explanation: 'Слова на -dad завжди жіночого роду: la ciudad, la verdad, la universidad.',
        },
        {
          text: 'Оберіть правильну форму множини: "la casa" →',
          options: ['los casas', 'las casa', 'las casas', 'les casas'],
          correct_index: 2,
          explanation: 'Жіночий множина: la → las, і додаємо -s до іменника: las casas.',
        },
        {
          text: 'Яке з цих слів є винятком з правила роду?',
          options: ['el gato', 'la mesa', 'el día', 'la casa'],
          correct_index: 2,
          explanation: '"El día" закінчується на -a, але має чоловічий рід — це виняток.',
        },
      ]),
    ],
  },

  // ===== Lesson 5 =====
  {
    title: '5. Кольори та базові прикметники',
    blocks: [
      text(`
<h2>Los colores y adjetivos básicos</h2>
<p>Прикметники в іспанській мові зазвичай стоять <strong>після</strong> іменника (на відміну від української). Вони також узгоджуються з іменником у роді та числі.</p>
<h3>Узгодження прикметників</h3>
<ul>
  <li>Чоловічий однина: el gato <strong>negro</strong></li>
  <li>Жіночий однина: la gata <strong>negra</strong></li>
  <li>Чоловічий множина: los gatos <strong>negros</strong></li>
  <li>Жіночий множина: las gatas <strong>negras</strong></li>
</ul>
<p>Прикметники на <strong>-e</strong> не змінюються за родом: un chico <strong>grande</strong>, una chica <strong>grande</strong>.</p>
      `),
      cards([
        { front: 'rojo / roja', back: 'червоний / червона', transcription: '[ро́хо / ро́ха]' },
        { front: 'azul', back: 'синій', transcription: '[асу́ль]' },
        { front: 'verde', back: 'зелений', transcription: '[бе́рде]' },
        { front: 'amarillo / amarilla', back: 'жовтий / жовта', transcription: '[амарі́льо]' },
        { front: 'blanco / blanca', back: 'білий / біла', transcription: '[бла́нко]' },
        { front: 'negro / negra', back: 'чорний / чорна', transcription: '[не́ґро]' },
        { front: 'grande', back: 'великий', transcription: '[ґра́нде]' },
        { front: 'pequeño / pequeña', back: 'маленький / маленька', transcription: '[пеке́ньо]' },
        { front: 'bonito / bonita', back: 'гарний / гарна', transcription: '[боні́то]' },
        { front: 'nuevo / nueva', back: 'новий / нова', transcription: '[нуе́бо]' },
        { front: 'viejo / vieja', back: 'старий / стара', transcription: '[бье́хо]' },
        { front: 'bueno / buena', back: 'добрий / добра, хороший', transcription: '[буе́но]' },
        { front: 'malo / mala', back: 'поганий / погана', transcription: '[ма́ло]' },
      ]),
      quiz([
        {
          text: 'Як правильно: "la casa ___" (білий)?',
          options: ['blanco', 'blanca', 'blancos', 'blancas'],
          correct_index: 1,
          explanation: 'Casa — жіночий рід, однина → blanca.',
        },
        {
          text: 'Де зазвичай стоїть прикметник в іспанській мові?',
          options: ['Перед іменником', 'Після іменника', 'На початку речення', 'Довільно'],
          correct_index: 1,
          explanation:
            'В іспанській мові прикметник зазвичай стоїть після іменника: el coche rojo (червона машина).',
        },
        {
          text: 'Яке з цих слів означає "зелений"?',
          options: ['azul', 'rojo', 'verde', 'amarillo'],
          correct_index: 2,
          explanation: 'Verde = зелений, azul = синій, rojo = червоний, amarillo = жовтий.',
        },
        {
          text: 'Як буде "маленькі будинки"?',
          options: [
            'la casa pequeña',
            'los casas pequeños',
            'las casas pequeñas',
            'las casas pequeños',
          ],
          correct_index: 2,
          explanation: 'Casas — жіночий множина → las casas pequeñas.',
        },
      ]),
    ],
  },

  // ===== Lesson 6 =====
  {
    title: "6. Сім'я",
    blocks: [
      text(`
<h2>La familia</h2>
<p>Сім'я — одна з найважливіших тем для початківців. Іспанці дуже сімейні люди, тому ця лексика знадобиться вам у перших же розмовах.</p>
<h3>Найближча родина</h3>
<ul>
  <li><strong>el padre</strong> — батько / <strong>la madre</strong> — мати</li>
  <li><strong>los padres</strong> — батьки</li>
  <li><strong>el hijo</strong> — син / <strong>la hija</strong> — дочка</li>
  <li><strong>el hermano</strong> — брат / <strong>la hermana</strong> — сестра</li>
  <li><strong>el abuelo</strong> — дідусь / <strong>la abuela</strong> — бабуся</li>
  <li><strong>el tío</strong> — дядько / <strong>la tía</strong> — тітка</li>
  <li><strong>el primo</strong> — двоюрідний брат / <strong>la prima</strong> — двоюрідна сестра</li>
  <li><strong>el marido / el esposo</strong> — чоловік (муж)</li>
  <li><strong>la mujer / la esposa</strong> — дружина</li>
</ul>
<h3>Корисні фрази</h3>
<ul>
  <li><strong>Tengo dos hermanos.</strong> — У мене є двоє братів/сестер.</li>
  <li><strong>Mi madre se llama Ana.</strong> — Мою маму звати Ана.</li>
  <li><strong>¿Tienes hijos?</strong> — У тебе є діти?</li>
  <li><strong>Somos una familia grande.</strong> — Ми велика сім'я.</li>
</ul>
      `),
      cards([
        { front: 'el padre', back: 'батько', transcription: '[ель па́дре]' },
        { front: 'la madre', back: 'мати', transcription: '[ла ма́дре]' },
        { front: 'el hermano', back: 'брат', transcription: '[ель ерма́но]' },
        { front: 'la hermana', back: 'сестра', transcription: '[ла ерма́на]' },
        { front: 'el hijo', back: 'син', transcription: '[ель і́хо]' },
        { front: 'la hija', back: 'дочка', transcription: '[ла і́ха]' },
        { front: 'el abuelo', back: 'дідусь', transcription: '[ель абуе́ло]' },
        { front: 'la abuela', back: 'бабуся', transcription: '[ла абуе́ла]' },
        { front: 'el tío', back: 'дядько', transcription: '[ель ті́о]' },
        { front: 'la tía', back: 'тітка', transcription: '[ла ті́а]' },
        { front: 'el marido', back: 'чоловік (муж)', transcription: '[ель марі́до]' },
        { front: 'la esposa', back: 'дружина', transcription: '[ла еспо́са]' },
      ]),
      quiz([
        {
          text: 'Як перекладається "los padres"?',
          options: ['Батьки', 'Батько', 'Священники', 'Дідусі'],
          correct_index: 0,
          explanation: '"Los padres" — батьки. "El padre" — батько (однина).',
        },
        {
          text: 'Як іспанською "бабуся"?',
          options: ['la abuela', 'la hermana', 'la tía', 'la madre'],
          correct_index: 0,
          explanation: 'La abuela = бабуся. La hermana = сестра. La tía = тітка.',
        },
        {
          text: 'Перекладіть: "Tengo dos hermanos"',
          options: [
            'Мої два брати',
            'У мене є двоє братів',
            'Я знаю двох братів',
            'Двоє братів прийшли',
          ],
          correct_index: 1,
          explanation: '"Tengo" = у мене є, "dos" = два, "hermanos" = брати.',
        },
        {
          text: 'Яке слово означає "двоюрідний брат"?',
          options: ['el hermano', 'el tío', 'el primo', 'el sobrino'],
          correct_index: 2,
          explanation: 'El primo = двоюрідний брат, el hermano = рідний брат.',
        },
      ]),
    ],
  },

  // ===== Lesson 7 =====
  {
    title: '7. Дні тижня, місяці та час',
    blocks: [
      text(`
<h2>Los días, los meses y la hora</h2>
<p>Зверніть увагу: в іспанській мові дні тижня та місяці пишуться з <strong>маленької літери</strong> (на відміну від англійської).</p>
<h3>Дні тижня (los días de la semana)</h3>
<p><strong>lunes</strong> (понеділок), <strong>martes</strong> (вівторок), <strong>miércoles</strong> (середа), <strong>jueves</strong> (четвер), <strong>viernes</strong> (п'ятниця), <strong>sábado</strong> (субота), <strong>domingo</strong> (неділя)</p>
<h3>Місяці (los meses)</h3>
<p><strong>enero</strong> (січень), <strong>febrero</strong> (лютий), <strong>marzo</strong> (березень), <strong>abril</strong> (квітень), <strong>mayo</strong> (травень), <strong>junio</strong> (червень), <strong>julio</strong> (липень), <strong>agosto</strong> (серпень), <strong>septiembre</strong> (вересень), <strong>octubre</strong> (жовтень), <strong>noviembre</strong> (листопад), <strong>diciembre</strong> (грудень)</p>
<h3>Як запитати час</h3>
<ul>
  <li><strong>¿Qué hora es?</strong> — Котра година?</li>
  <li><strong>Es la una.</strong> — Перша година. (однина, бо "одна")</li>
  <li><strong>Son las dos / tres / cuatro…</strong> — Друга / третя / четверта…</li>
  <li><strong>Son las diez y media.</strong> — Пів на одинадцяту (10:30).</li>
  <li><strong>Son las nueve y cuarto.</strong> — Чверть на десяту (9:15).</li>
</ul>
      `),
      cards([
        { front: 'lunes', back: 'понеділок', transcription: '[лу́нес]' },
        { front: 'martes', back: 'вівторок', transcription: '[ма́ртес]' },
        { front: 'miércoles', back: 'середа', transcription: '[мьє́рколес]' },
        { front: 'jueves', back: 'четвер', transcription: '[хуе́бес]' },
        { front: 'viernes', back: "п'ятниця", transcription: '[бьє́рнес]' },
        { front: 'sábado', back: 'субота', transcription: '[са́бадо]' },
        { front: 'domingo', back: 'неділя', transcription: '[домі́нґо]' },
        { front: 'enero', back: 'січень', transcription: '[ене́ро]' },
        { front: 'mayo', back: 'травень', transcription: '[ма́йо]' },
        { front: 'septiembre', back: 'вересень', transcription: '[септьє́мбре]' },
        { front: '¿Qué hora es?', back: 'Котра година?', transcription: '[ке о́ра ес]' },
        { front: 'y media', back: 'і половина (30 хв)', transcription: '[і ме́дьа]' },
        { front: 'y cuarto', back: 'і чверть (15 хв)', transcription: '[і куа́рто]' },
      ]),
      quiz([
        {
          text: 'Який день тижня — "miércoles"?',
          options: ['Понеділок', 'Вівторок', 'Середа', 'Четвер'],
          correct_index: 2,
          explanation: 'Miércoles = середа. Lunes = понеділок, martes = вівторок, jueves = четвер.',
        },
        {
          text: 'Як правильно сказати "10:30"?',
          options: [
            'Son las diez y media',
            'Es la diez y media',
            'Son las diez y cuarto',
            'Es las diez y media',
          ],
          correct_index: 0,
          explanation:
            '"Son las" використовується для всіх годин, крім 1:00. "Y media" = половина.',
        },
        {
          text: 'Як іспанською "грудень"?',
          options: ['Noviembre', 'Diciembre', 'Octubre', 'Septiembre'],
          correct_index: 1,
          explanation: 'Diciembre = грудень. Noviembre = листопад.',
        },
        {
          text: 'Чому для 1:00 кажуть "Es la una", а не "Son las una"?',
          options: [
            'Це виняток без правила',
            'Бо "una" — однина, тому дієслово теж в однині',
            'Обидва варіанти правильні',
            'Так кажуть лише в Іспанії',
          ],
          correct_index: 1,
          explanation:
            'Оскільки "una" (одна) — однина, використовується "Es la una". Для решти — "Son las + число".',
        },
      ]),
    ],
  },

  // ===== Lesson 8 =====
  {
    title: '8. Дієслова ser та estar',
    blocks: [
      text(`
<h2>Ser y estar — два дієслова "бути"</h2>
<p>В іспанській мові є <strong>два дієслова</strong>, що означають "бути": <strong>ser</strong> та <strong>estar</strong>. Для українців це незвично, бо в нас одне "бути". Це одна з найскладніших тем для початківців, але правила досить чіткі.</p>
<h3>SER — постійні характеристики</h3>
<table>
  <tr><th>Особа</th><th>Форма</th><th>Приклад</th></tr>
  <tr><td>yo</td><td><strong>soy</strong></td><td>Soy ucraniano. (Я українець.)</td></tr>
  <tr><td>tú</td><td><strong>eres</strong></td><td>Eres estudiante. (Ти студент.)</td></tr>
  <tr><td>él/ella/usted</td><td><strong>es</strong></td><td>Es profesor. (Він вчитель.)</td></tr>
  <tr><td>nosotros</td><td><strong>somos</strong></td><td>Somos amigos. (Ми друзі.)</td></tr>
  <tr><td>ellos/ellas/ustedes</td><td><strong>son</strong></td><td>Son españoles. (Вони іспанці.)</td></tr>
</table>
<p><strong>SER</strong> використовують для: національності, професії, характеру, зовнішності, матеріалу, часу, походження.</p>
<h3>ESTAR — стани та місцезнаходження</h3>
<table>
  <tr><th>Особа</th><th>Форма</th><th>Приклад</th></tr>
  <tr><td>yo</td><td><strong>estoy</strong></td><td>Estoy cansado. (Я втомлений.)</td></tr>
  <tr><td>tú</td><td><strong>estás</strong></td><td>¿Estás bien? (Ти в порядку?)</td></tr>
  <tr><td>él/ella/usted</td><td><strong>está</strong></td><td>Está en casa. (Він/вона вдома.)</td></tr>
  <tr><td>nosotros</td><td><strong>estamos</strong></td><td>Estamos contentos. (Ми задоволені.)</td></tr>
  <tr><td>ellos/ellas/ustedes</td><td><strong>están</strong></td><td>Están en Madrid. (Вони в Мадриді.)</td></tr>
</table>
<p><strong>ESTAR</strong> використовують для: місцезнаходження, емоцій, тимчасових станів, результату дії.</p>
<h3>Порівняйте</h3>
<ul>
  <li><strong>María es guapa.</strong> — Марія гарна (завжди, це її характеристика).</li>
  <li><strong>María está guapa.</strong> — Марія виглядає гарно (сьогодні, в цьому платті).</li>
</ul>
      `),
      cards([
        { front: 'yo soy', back: 'я є (постійно)', transcription: '[йо сой]' },
        { front: 'tú eres', back: 'ти є (постійно)', transcription: '[ту е́рес]' },
        { front: 'él/ella es', back: 'він/вона є (постійно)', transcription: '[ес]' },
        { front: 'nosotros somos', back: 'ми є (постійно)', transcription: '[со́мос]' },
        { front: 'ellos son', back: 'вони є (постійно)', transcription: '[сон]' },
        { front: 'yo estoy', back: 'я є (зараз, тут)', transcription: '[йо есто́й]' },
        { front: 'tú estás', back: 'ти є (зараз, тут)', transcription: '[ту еста́с]' },
        { front: 'él/ella está', back: 'він/вона є (зараз, тут)', transcription: '[еста́]' },
        { front: 'nosotros estamos', back: 'ми є (зараз, тут)', transcription: '[еста́мос]' },
        { front: 'ellos están', back: 'вони є (зараз, тут)', transcription: '[еста́н]' },
      ]),
      quiz([
        {
          text: 'Оберіть правильне: "Yo ___ profesor." (Я вчитель.)',
          options: ['estoy', 'soy', 'es', 'está'],
          correct_index: 1,
          explanation: 'Професія — постійна характеристика → ser. "Yo soy profesor."',
        },
        {
          text: '"El libro ___ en la mesa." (Книга на столі.)',
          options: ['es', 'ser', 'está', 'son'],
          correct_index: 2,
          explanation: 'Місцезнаходження → estar. "El libro está en la mesa."',
        },
        {
          text: '"Ellos ___ de Colombia." (Вони з Колумбії.)',
          options: ['están', 'estamos', 'son', 'están'],
          correct_index: 2,
          explanation: 'Походження — постійна характеристика → ser. "Ellos son de Colombia."',
        },
        {
          text: '"Hoy ___ muy cansada." (Сьогодні я дуже втомлена.)',
          options: ['soy', 'es', 'estoy', 'somos'],
          correct_index: 2,
          explanation: 'Тимчасовий стан → estar. "Hoy estoy muy cansada."',
        },
        {
          text: 'Яка різниця: "Ana es nerviosa" vs "Ana está nerviosa"?',
          options: [
            'Немає різниці',
            'Перше — вона нервова за характером, друге — вона нервує зараз',
            'Перше — формально, друге — неформально',
            'Перше — неправильно граматично',
          ],
          correct_index: 1,
          explanation: 'Ser + прикметник = постійна риса. Estar + прикметник = тимчасовий стан.',
        },
      ]),
    ],
  },

  // ===== Lesson 9 =====
  {
    title: '9. У ресторані та кафе',
    blocks: [
      text(`
<h2>En el restaurante</h2>
<p>Вміти замовити їжу — один з найпрактичніших навиків. Ось основні фрази для ресторану.</p>
<h3>Основні фрази</h3>
<ul>
  <li><strong>Una mesa para dos, por favor.</strong> — Столик на двох, будь ласка.</li>
  <li><strong>¿Puedo ver el menú?</strong> — Чи можу я побачити меню?</li>
  <li><strong>¿Qué me recomienda?</strong> — Що ви рекомендуєте?</li>
  <li><strong>Quiero / Quisiera…</strong> — Я хочу / Я б хотів…</li>
  <li><strong>Para mí…</strong> — Для мене…</li>
  <li><strong>La cuenta, por favor.</strong> — Рахунок, будь ласка.</li>
  <li><strong>¿Está incluida la propina?</strong> — Чайові включені?</li>
</ul>
<h3>Їжа та напої</h3>
<ul>
  <li><strong>el agua</strong> — вода</li>
  <li><strong>el café</strong> — кава</li>
  <li><strong>el vino tinto / blanco</strong> — червоне / біле вино</li>
  <li><strong>la cerveza</strong> — пиво</li>
  <li><strong>el pan</strong> — хліб</li>
  <li><strong>la ensalada</strong> — салат</li>
  <li><strong>el pollo</strong> — курка</li>
  <li><strong>el pescado</strong> — риба</li>
  <li><strong>la carne</strong> — м'ясо</li>
  <li><strong>el postre</strong> — десерт</li>
</ul>
      `),
      cards([
        {
          front: 'La cuenta, por favor.',
          back: 'Рахунок, будь ласка.',
          transcription: '[ла куе́нта, пор фабо́р]',
        },
        { front: 'Quiero un café.', back: 'Я хочу каву.', transcription: '[кье́ро ун кафе́]' },
        {
          front: '¿Qué me recomienda?',
          back: 'Що Ви рекомендуєте?',
          transcription: '[ке ме рекомье́нда]',
        },
        { front: 'el agua', back: 'вода', transcription: '[ель а́ґуа]' },
        { front: 'la cerveza', back: 'пиво', transcription: '[ла серве́са]' },
        { front: 'el vino tinto', back: 'червоне вино', transcription: '[ель бі́но ті́нто]' },
        { front: 'el pollo', back: 'курка', transcription: '[ель по́льо]' },
        { front: 'el pescado', back: 'риба', transcription: '[ель песка́до]' },
        { front: 'la carne', back: "м'ясо", transcription: '[ла ка́рне]' },
        { front: 'la ensalada', back: 'салат', transcription: '[ла енсала́да]' },
        { front: 'el postre', back: 'десерт', transcription: '[ель по́стре]' },
        { front: 'el pan', back: 'хліб', transcription: '[ель пан]' },
        { front: '¡Está delicioso!', back: 'Це смачно!', transcription: '[еста́ деліcьо́со]' },
      ]),
      quiz([
        {
          text: 'Як попросити рахунок в ресторані?',
          options: [
            'El menú, por favor.',
            'La cuenta, por favor.',
            'La mesa, por favor.',
            'El dinero, por favor.',
          ],
          correct_index: 1,
          explanation: '"La cuenta" = рахунок. "El menú" = меню. "La mesa" = столик.',
        },
        {
          text: 'Що означає "el pescado"?',
          options: ['Курка', "М'ясо", 'Риба', 'Свинина'],
          correct_index: 2,
          explanation: "El pescado = риба (як страва). El pollo = курка. La carne = м'ясо.",
        },
        {
          text: 'Як ввічливо замовити каву?',
          options: ['¡Café!', 'Dame café.', 'Quisiera un café, por favor.', 'Necesito café.'],
          correct_index: 2,
          explanation:
            '"Quisiera" (я б хотів/ла) — ввічлива форма замовлення. "Por favor" додає ввічливості.',
        },
        {
          text: '"El agua" — якого роду це слово?',
          options: [
            'Жіночого — la agua',
            'Чоловічого — el agua',
            'Жіночого, але з артиклем "el" для милозвучності',
            'Середнього',
          ],
          correct_index: 2,
          explanation:
            '"Agua" — жіночого роду, але використовує "el" перед наголошеним "a-": el agua fría (з жіночим прикметником).',
        },
      ]),
    ],
  },

  // ===== Lesson 10 =====
  {
    title: '10. Мій день — щоденні дії',
    blocks: [
      text(`
<h2>Mi día — las acciones cotidianas</h2>
<p>Розповідь про свій день — базовий навик розмовної мови. Для цього потрібно знати зворотні дієслова та прості дії.</p>
<h3>Зворотні дієслова (verbos reflexivos)</h3>
<p>Багато дієслів щоденної рутини є зворотними — вони мають частку <strong>-se</strong> та потребують зворотного займенника:</p>
<table>
  <tr><th>Особа</th><th>Займенник</th><th>Приклад: levantarse</th></tr>
  <tr><td>yo</td><td><strong>me</strong></td><td>me levanto (я встаю)</td></tr>
  <tr><td>tú</td><td><strong>te</strong></td><td>te levantas (ти встаєш)</td></tr>
  <tr><td>él/ella</td><td><strong>se</strong></td><td>se levanta (він/вона встає)</td></tr>
  <tr><td>nosotros</td><td><strong>nos</strong></td><td>nos levantamos (ми встаємо)</td></tr>
  <tr><td>ellos</td><td><strong>se</strong></td><td>se levantan (вони встають)</td></tr>
</table>
<h3>Типовий день</h3>
<ol>
  <li><strong>Me despierto</strong> a las siete. — Я прокидаюся о сьомій.</li>
  <li><strong>Me levanto</strong> y <strong>me ducho</strong>. — Я встаю і приймаю душ.</li>
  <li><strong>Desayuno</strong> a las ocho. — Я снідаю о восьмій.</li>
  <li><strong>Voy</strong> al trabajo. — Я їду на роботу.</li>
  <li><strong>Almuerzo</strong> a las dos. — Я обідаю о другій.</li>
  <li><strong>Vuelvo</strong> a casa a las seis. — Я повертаюся додому о шостій.</li>
  <li><strong>Ceno</strong> a las nueve. — Я вечеряю о дев'ятій.</li>
  <li><strong>Me acuesto</strong> a las once. — Я лягаю спати об одинадцятій.</li>
</ol>
      `),
      cards([
        { front: 'despertarse', back: 'прокидатися', transcription: '[деспертарсе]' },
        { front: 'levantarse', back: 'вставати', transcription: '[лебантарсе]' },
        { front: 'ducharse', back: 'приймати душ', transcription: '[дучарсе]' },
        { front: 'desayunar', back: 'снідати', transcription: '[десаюна́р]' },
        { front: 'almorzar', back: 'обідати', transcription: '[альморса́р]' },
        { front: 'cenar', back: 'вечеряти', transcription: '[сена́р]' },
        { front: 'acostarse', back: 'лягати спати', transcription: '[акостарсе]' },
        { front: 'vestirse', back: 'одягатися', transcription: '[бесті́рсе]' },
        { front: 'ir al trabajo', back: 'їхати на роботу', transcription: '[ір аль трабахо]' },
        { front: 'volver a casa', back: 'повертатися додому', transcription: '[больбе́р а ка́са]' },
        {
          front: 'lavarse los dientes',
          back: 'чистити зуби',
          transcription: '[лаба́рсе лос дьє́нтес]',
        },
        { front: 'peinarse', back: 'зачісуватися', transcription: '[пейна́рсе]' },
      ]),
      quiz([
        {
          text: 'Як правильно: "Yo ___ a las siete." (Я встаю о 7.)',
          options: ['me levanto', 'se levanto', 'me levanta', 'levanto me'],
          correct_index: 0,
          explanation:
            'Для "yo" зворотний займенник — "me", і він стоїть перед дієсловом: me levanto.',
        },
        {
          text: 'Що означає "almorzar"?',
          options: ['Снідати', 'Обідати', 'Вечеряти', 'Перекусити'],
          correct_index: 1,
          explanation: 'Desayunar = снідати, almorzar = обідати, cenar = вечеряти.',
        },
        {
          text: 'Перекладіть: "Ella se ducha por la mañana."',
          options: [
            'Вона приймає душ вранці.',
            'Вона миє руки вранці.',
            'Вона прокидається вранці.',
            'Вона снідає вранці.',
          ],
          correct_index: 0,
          explanation: '"Ducharse" = приймати душ, "por la mañana" = вранці.',
        },
        {
          text: 'Які з цих дієслів є зворотними?',
          options: [
            'comer, beber, leer',
            'levantarse, ducharse, acostarse',
            'hablar, escribir, vivir',
            'ir, venir, salir',
          ],
          correct_index: 1,
          explanation: 'Зворотні дієслова мають закінчення -se: levantarse, ducharse, acostarse.',
        },
      ]),
    ],
  },

  // ===== Lesson 11 =====
  {
    title: '11. Подорож та орієнтування в місті',
    blocks: [
      text(`
<h2>Viajar y orientarse en la ciudad</h2>
<p>Коли ви подорожуєте іспаномовними країнами, вам знадобляться фрази для орієнтування в місті, транспорту та базових ситуацій.</p>
<h3>Питання дороги</h3>
<ul>
  <li><strong>¿Dónde está…?</strong> — Де знаходиться…?</li>
  <li><strong>¿Cómo llego a…?</strong> — Як дістатися до…?</li>
  <li><strong>¿Está lejos / cerca?</strong> — Це далеко / близько?</li>
  <li><strong>Gire a la derecha / izquierda.</strong> — Поверніть направо / наліво.</li>
  <li><strong>Siga todo recto.</strong> — Ідіть прямо.</li>
</ul>
<h3>Транспорт</h3>
<ul>
  <li><strong>el autobús</strong> — автобус</li>
  <li><strong>el metro</strong> — метро</li>
  <li><strong>el tren</strong> — потяг</li>
  <li><strong>el taxi</strong> — таксі</li>
  <li><strong>el aeropuerto</strong> — аеропорт</li>
  <li><strong>la estación</strong> — вокзал / станція</li>
  <li><strong>la parada</strong> — зупинка</li>
  <li><strong>un billete</strong> — квиток</li>
  <li><strong>ida y vuelta</strong> — туди й назад</li>
</ul>
<h3>Корисні фрази</h3>
<ul>
  <li><strong>Un billete de ida y vuelta a Madrid, por favor.</strong> — Квиток туди й назад до Мадрида, будь ласка.</li>
  <li><strong>¿A qué hora sale el tren?</strong> — О котрій відправляється потяг?</li>
  <li><strong>¿Cuánto cuesta?</strong> — Скільки коштує?</li>
  <li><strong>Estoy perdido/a.</strong> — Я заблукав/ла.</li>
</ul>
      `),
      cards([
        { front: '¿Dónde está…?', back: 'Де знаходиться…?', transcription: '[до́нде еста́]' },
        { front: 'a la derecha', back: 'направо', transcription: '[а ла дере́ча]' },
        { front: 'a la izquierda', back: 'наліво', transcription: '[а ла іскьє́рда]' },
        { front: 'todo recto', back: 'прямо', transcription: '[то́до ре́кто]' },
        { front: 'el autobús', back: 'автобус', transcription: '[ель аутобу́с]' },
        { front: 'el metro', back: 'метро', transcription: '[ель ме́тро]' },
        { front: 'el tren', back: 'потяг', transcription: '[ель трен]' },
        { front: 'el aeropuerto', back: 'аеропорт', transcription: '[ель аеропуе́рто]' },
        { front: 'un billete', back: 'квиток', transcription: '[ун більє́те]' },
        { front: '¿Cuánto cuesta?', back: 'Скільки коштує?', transcription: '[куа́нто куе́ста]' },
        { front: 'Estoy perdido/a.', back: 'Я заблукав/ла.', transcription: '[есто́й перді́до/а]' },
        { front: 'cerca / lejos', back: 'близько / далеко', transcription: '[се́рка / ле́хос]' },
      ]),
      quiz([
        {
          text: 'Як запитати "Скільки коштує?" іспанською?',
          options: ['¿Cuánto tiempo?', '¿Cuánto cuesta?', '¿Cuántos años?', '¿Cuánto es lejos?'],
          correct_index: 1,
          explanation: '"¿Cuánto cuesta?" = Скільки коштує? "Cuánto tiempo" = скільки часу.',
        },
        {
          text: 'Що означає "ida y vuelta"?',
          options: ['Тільки туди', 'Туди й назад', 'Першим класом', 'Без пересадок'],
          correct_index: 1,
          explanation: '"Ida" = туди, "vuelta" = назад. "Ida y vuelta" = туди й назад.',
        },
        {
          text: 'Як сказати "Поверніть наліво"?',
          options: [
            'Gire a la derecha.',
            'Siga todo recto.',
            'Gire a la izquierda.',
            'Está cerca.',
          ],
          correct_index: 2,
          explanation: '"A la izquierda" = наліво. "A la derecha" = направо.',
        },
        {
          text: 'Перекладіть: "¿A qué hora sale el tren?"',
          options: [
            'Де зупиняється потяг?',
            'О котрій відправляється потяг?',
            'Скільки коштує потяг?',
            'Коли приїде потяг?',
          ],
          correct_index: 1,
          explanation: '"¿A qué hora?" = О котрій?, "sale" = відправляється, "el tren" = потяг.',
        },
      ]),
    ],
  },

  // ===== Lesson 12 =====
  {
    title: '12. Дієслова першої групи (-AR)',
    blocks: [
      text(`
<h2>Verbos regulares en -AR (presente)</h2>
<p>Більшість іспанських дієслів належать до першої групи — з закінченням <strong>-ar</strong>. Вони відмінюються за простим і передбачуваним правилом.</p>
<h3>Правило відмінювання</h3>
<p>Відкидаємо <strong>-ar</strong> і додаємо закінчення:</p>
<table>
  <tr><th>Особа</th><th>Закінчення</th><th>hablar (говорити)</th></tr>
  <tr><td>yo</td><td><strong>-o</strong></td><td>habl<strong>o</strong></td></tr>
  <tr><td>tú</td><td><strong>-as</strong></td><td>habl<strong>as</strong></td></tr>
  <tr><td>él/ella/usted</td><td><strong>-a</strong></td><td>habl<strong>a</strong></td></tr>
  <tr><td>nosotros/as</td><td><strong>-amos</strong></td><td>habl<strong>amos</strong></td></tr>
  <tr><td>ellos/ellas/ustedes</td><td><strong>-an</strong></td><td>habl<strong>an</strong></td></tr>
</table>
<h3>Найуживаніші дієслова на -ar</h3>
<ul>
  <li><strong>hablar</strong> — говорити</li>
  <li><strong>estudiar</strong> — вивчати</li>
  <li><strong>trabajar</strong> — працювати</li>
  <li><strong>comprar</strong> — купувати</li>
  <li><strong>cocinar</strong> — готувати (їжу)</li>
  <li><strong>viajar</strong> — подорожувати</li>
  <li><strong>escuchar</strong> — слухати</li>
  <li><strong>mirar</strong> — дивитися</li>
  <li><strong>llamar</strong> — дзвонити / називати</li>
  <li><strong>necesitar</strong> — потребувати</li>
</ul>
      `),
      cards([
        { front: 'hablar', back: 'говорити', transcription: '[абла́р]' },
        { front: 'estudiar', back: 'вивчати', transcription: '[естудья́р]' },
        { front: 'trabajar', back: 'працювати', transcription: '[трабаха́р]' },
        { front: 'comprar', back: 'купувати', transcription: '[компра́р]' },
        { front: 'cocinar', back: 'готувати їжу', transcription: '[косіна́р]' },
        { front: 'viajar', back: 'подорожувати', transcription: '[бьяха́р]' },
        { front: 'escuchar', back: 'слухати', transcription: '[ескуча́р]' },
        { front: 'mirar', back: 'дивитися', transcription: '[міра́р]' },
        { front: 'llamar', back: 'дзвонити, називати', transcription: '[йяма́р]' },
        { front: 'necesitar', back: 'потребувати', transcription: '[несесіта́р]' },
        { front: 'cantar', back: 'співати', transcription: '[канта́р]' },
        { front: 'bailar', back: 'танцювати', transcription: '[байла́р]' },
      ]),
      quiz([
        {
          text: 'Як правильно: "Yo ___ español." (Я говорю іспанською.)',
          options: ['hablas', 'hablo', 'habla', 'hablamos'],
          correct_index: 1,
          explanation: 'Для "yo" закінчення — "-o": yo hablo.',
        },
        {
          text: 'Відмініть "estudiar" для "nosotros":',
          options: ['estudiamos', 'estudian', 'estudias', 'estudia'],
          correct_index: 0,
          explanation: 'Nosotros + -ar дієслово → закінчення "-amos": estudiamos.',
        },
        {
          text: '"Ellas ___ mucho." (Вони багато подорожують.)',
          options: ['viajo', 'viajan', 'viajamos', 'viajas'],
          correct_index: 1,
          explanation: 'Для "ellas" закінчення — "-an": ellas viajan.',
        },
        {
          text: 'Яке з цих дієслів НЕ належить до групи -ar?',
          options: ['comprar', 'hablar', 'vivir', 'trabajar'],
          correct_index: 2,
          explanation: '"Vivir" (жити) закінчується на -ir, це третя група дієслів.',
        },
        {
          text: 'Перекладіть: "Tú cocinas muy bien."',
          options: [
            'Ти дуже добре готуєш.',
            'Ти дуже добре танцюєш.',
            'Він дуже добре готує.',
            'Ти добре купуєш.',
          ],
          correct_index: 0,
          explanation: '"Cocinas" = ти готуєш (від cocinar), "muy bien" = дуже добре.',
        },
      ]),
    ],
  },
]

// ---------- Main ----------

async function main() {
  // Find the owner or teacher profile to set as created_by
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('school_id', schoolId)
    .in('role', ['owner', 'teacher'])
    .limit(1)
    .single()

  if (profileError || !profile) {
    console.error(
      'Could not find an owner/teacher profile. Run seed-users.ts first.',
      profileError?.message
    )
    process.exit(1)
  }

  course.created_by = profile.id
  console.log(`Using profile ${profile.id} as course creator.`)

  // Delete existing course data for idempotency
  const { data: existingCourses } = await supabase
    .from('courses')
    .select('id')
    .eq('school_id', schoolId)
    .eq('title', course.title)

  if (existingCourses && existingCourses.length > 0) {
    const courseIds = existingCourses.map((c) => c.id)
    console.log(`Deleting ${courseIds.length} existing course(s) with the same title...`)

    // Delete blocks first (FK constraint)
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('id')
      .in('course_id', courseIds)

    if (existingLessons && existingLessons.length > 0) {
      const lessonIds = existingLessons.map((l) => l.id)
      await supabase.from('lesson_blocks').delete().in('lesson_id', lessonIds)
    }

    await supabase.from('lessons').delete().in('course_id', courseIds)
    await supabase.from('courses').delete().in('id', courseIds)
  }

  // Insert course
  const { error: courseError } = await supabase.from('courses').insert(course)
  if (courseError) {
    console.error('Failed to insert course:', courseError.message)
    process.exit(1)
  }
  console.log(`Course created: "${course.title}" (${courseId})`)

  // Insert lessons and blocks
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]
    const lessonId = randomUUID()

    const { error: lessonError } = await supabase.from('lessons').insert({
      id: lessonId,
      course_id: courseId,
      school_id: schoolId,
      title: lesson.title,
      order_index: i,
      is_published: true,
    })

    if (lessonError) {
      console.error(`Failed to insert lesson "${lesson.title}":`, lessonError.message)
      continue
    }

    const blockRows = lesson.blocks.map((block, blockIdx) => ({
      id: randomUUID(),
      lesson_id: lessonId,
      school_id: schoolId,
      type: block.type,
      order_index: blockIdx,
      content: block.content,
    }))

    const { error: blocksError } = await supabase.from('lesson_blocks').insert(blockRows)

    if (blocksError) {
      console.error(`Failed to insert blocks for "${lesson.title}":`, blocksError.message)
    } else {
      console.log(
        `  Lesson ${i + 1}/${lessons.length}: "${lesson.title}" — ${blockRows.length} blocks`
      )
    }
  }

  console.log('\nDone! Course seeded successfully.')
}

main()
