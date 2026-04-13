import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { createInterface } from 'readline'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const schoolId = '00000000-0000-0000-0000-000000000001'

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const users = [
  {
    email: 'maria@spanishmk.vercel.app',
    password: 'pw123456',
    role: 'owner',
    fullName: 'Марія Кривоніс',
    permissions: [] as string[],
  },
  {
    email: 'carmen@spanishmk.vercel.app',
    password: 'pw123456',
    role: 'teacher',
    fullName: 'Carmen García',
    permissions: ['manage_courses', 'manage_students'],
  },
  {
    email: 'oleksandra@spanishmk.vercel.app',
    password: 'pw123456',
    role: 'student',
    fullName: 'Олександра Бондаренко',
    permissions: [] as string[],
  },
  {
    email: 'andriy@spanishmk.vercel.app',
    password: 'pw123456',
    role: 'student',
    fullName: 'Андрій Шевченко',
    permissions: [] as string[],
  },
  {
    email: 'daryna@spanishmk.vercel.app',
    password: 'pw123456',
    role: 'student',
    fullName: 'Дарина Мельник',
    permissions: [] as string[],
  },
  {
    email: 'maksym@spanishmk.vercel.app',
    password: 'pw123456',
    role: 'student',
    fullName: 'Максим Ткаченко',
    permissions: [] as string[],
  },
  {
    email: 'sofia@spanishmk.vercel.app',
    password: 'pw123456',
    role: 'student',
    fullName: 'Софія Литвиненко',
    permissions: [] as string[],
  },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

interface FillInBlankQuestion {
  sentence: string
  hint?: string
  answers: string[]
  explanation?: string
}

type BlockSeed =
  | { type: 'text'; content: { html: string } }
  | { type: 'flashcards'; content: { cards: FlashcardItem[] } }
  | { type: 'quiz'; content: { questions: QuizQuestion[] } }
  | { type: 'video'; content: { url: string; title?: string } }
  | {
      type: 'embed'
      content: {
        embed_code: string
        embed_url?: string
        source_url?: string
        height?: number
      }
    }
  | { type: 'fill_in_blank'; content: { questions: FillInBlankQuestion[] } }

function cards(items: FlashcardItem[]): BlockSeed {
  return {
    type: 'flashcards',
    content: { cards: items.map((c) => ({ ...c, id: randomUUID() })) },
  }
}

function quiz(questions: QuizQuestion[]): BlockSeed {
  return {
    type: 'quiz',
    content: { questions: questions.map((q) => ({ ...q, id: randomUUID() })) },
  }
}

function text(html: string): BlockSeed {
  return { type: 'text', content: { html } }
}

function video(url: string, title?: string): BlockSeed {
  return { type: 'video', content: { url, title } }
}

function fillInBlank(questions: FillInBlankQuestion[]): BlockSeed {
  return {
    type: 'fill_in_blank',
    content: { questions: questions.map((q) => ({ ...q, id: randomUUID() })) },
  }
}

// ---------------------------------------------------------------------------
// Course: Español A1 — based on real Notion export
// ---------------------------------------------------------------------------

const courseId = randomUUID()

const course = {
  id: courseId,
  school_id: schoolId,
  title: 'Español A1: Іспанська для початківців',
  description:
    'Курс іспанської мови рівня A1. Від неправильних дієслів та привітань до їжі, фруктів та овочів. Заняття щочетверга.',
  is_published: true,
  cover_url: null,
  created_by: '',
}

const lessons: LessonSeed[] = [
  // ===== Clase 1. Verbos irregulares =====
  {
    title: 'Clase 1. Verbos irregulares',
    blocks: [
      {
        type: 'embed' as const,
        content: {
          embed_code: '',
          embed_url: 'https://www.canva.com/design/DAG_4RP25uQ/aMYtc2fUCGCRcyttEtd1yw/view?embed',
          source_url: 'https://www.canva.com/design/DAG_4RP25uQ/aMYtc2fUCGCRcyttEtd1yw/edit',
          height: 600,
        },
      },
      text(`
<h2>Неправильні дієслова у теперішньому часі</h2>
<p>В іспанській мові є група дієслів, які змінюють голосну в корені при відмінюванні у <strong>Presente de Indicativo</strong>. Ці зміни відбуваються у всіх формах, крім <em>nosotros</em> та <em>vosotros</em>.</p>
<h3>Тип 1: O → UE</h3>
<table>
  <tr><th>Особа</th><th>poder (могти)</th><th>dormir (спати)</th><th>volver (повертатися)</th></tr>
  <tr><td>yo</td><td>p<strong>ue</strong>do</td><td>d<strong>ue</strong>rmo</td><td>v<strong>ue</strong>lvo</td></tr>
  <tr><td>tú</td><td>p<strong>ue</strong>des</td><td>d<strong>ue</strong>rmes</td><td>v<strong>ue</strong>lves</td></tr>
  <tr><td>él/ella</td><td>p<strong>ue</strong>de</td><td>d<strong>ue</strong>rme</td><td>v<strong>ue</strong>lve</td></tr>
  <tr><td>nosotros</td><td>podemos</td><td>dormimos</td><td>volvemos</td></tr>
  <tr><td>ellos</td><td>p<strong>ue</strong>den</td><td>d<strong>ue</strong>rmen</td><td>v<strong>ue</strong>lven</td></tr>
</table>
<h3>Тип 2: E → IE</h3>
<table>
  <tr><th>Особа</th><th>querer (хотіти)</th><th>pensar (думати)</th><th>preferir (віддавати перевагу)</th></tr>
  <tr><td>yo</td><td>qu<strong>ie</strong>ro</td><td>p<strong>ie</strong>nso</td><td>pref<strong>ie</strong>ro</td></tr>
  <tr><td>tú</td><td>qu<strong>ie</strong>res</td><td>p<strong>ie</strong>nsas</td><td>pref<strong>ie</strong>res</td></tr>
  <tr><td>él/ella</td><td>qu<strong>ie</strong>re</td><td>p<strong>ie</strong>nsa</td><td>pref<strong>ie</strong>re</td></tr>
  <tr><td>nosotros</td><td>queremos</td><td>pensamos</td><td>preferimos</td></tr>
  <tr><td>ellos</td><td>qu<strong>ie</strong>ren</td><td>p<strong>ie</strong>nsan</td><td>pref<strong>ie</strong>ren</td></tr>
</table>
<h3>Тип 3: E → I</h3>
<p>Тільки дієслова на <strong>-ir</strong>: <em>pedir</em> (просити), <em>repetir</em> (повторювати), <em>servir</em> (подавати).</p>
<table>
  <tr><th>Особа</th><th>pedir</th></tr>
  <tr><td>yo</td><td>p<strong>i</strong>do</td></tr>
  <tr><td>tú</td><td>p<strong>i</strong>des</td></tr>
  <tr><td>él/ella</td><td>p<strong>i</strong>de</td></tr>
  <tr><td>nosotros</td><td>pedimos</td></tr>
  <tr><td>ellos</td><td>p<strong>i</strong>den</td></tr>
</table>
      `),
      cards([
        { front: 'poder', back: 'могти', transcription: '[поде́р]' },
        { front: 'dormir', back: 'спати', transcription: '[dormí r]' },
        { front: 'volver', back: 'повертатися', transcription: '[больбе́р]' },
        { front: 'querer', back: 'хотіти', transcription: '[кере́р]' },
        { front: 'pensar', back: 'думати', transcription: '[пенса́р]' },
        { front: 'preferir', back: 'віддавати перевагу', transcription: '[префері́р]' },
        { front: 'pedir', back: 'просити', transcription: '[педі́р]' },
        { front: 'repetir', back: 'повторювати', transcription: '[репеті́р]' },
        { front: 'encontrar', back: 'знаходити', transcription: '[енконтра́р]' },
        { front: 'contar', back: 'рахувати / розповідати', transcription: '[конта́р]' },
        { front: 'empezar', back: 'починати', transcription: '[емпеса́р]' },
        { front: 'entender', back: 'розуміти', transcription: '[ентенде́р]' },
      ]),
      quiz([
        {
          text: 'Як правильно: "Yo ___ a las 7." (Я можу о 7.)',
          options: ['podo', 'puedo', 'poder', 'puedos'],
          correct_index: 1,
          explanation: 'O → UE: poder → yo puedo.',
        },
        {
          text: 'Яка форма правильна: "Ella ___ pizza." (Вона хоче піцу.)',
          options: ['quere', 'quiere', 'quiero', 'queremos'],
          correct_index: 1,
          explanation: 'E → IE: querer → ella quiere.',
        },
        {
          text: 'Відмініть "dormir" для "nosotros":',
          options: ['duermimos', 'dormimos', 'duermemos', 'dormemos'],
          correct_index: 1,
          explanation: 'Для nosotros зміна НЕ відбувається: nosotros dormimos.',
        },
        {
          text: 'Як правильно: "Ellos ___ la cuenta." (Вони просять рахунок.)',
          options: ['peden', 'pedimos', 'piden', 'pedir'],
          correct_index: 2,
          explanation: 'E → I: pedir → ellos piden.',
        },
        {
          text: 'Яке з цих дієслів має зміну O → UE?',
          options: ['hablar', 'comer', 'volver', 'vivir'],
          correct_index: 2,
          explanation: 'Volver: yo vuelvo, tú vuelves, él vuelve... nosotros volvemos.',
        },
      ]),
      fillInBlank([
        {
          sentence: 'Juan no {{1}} sus gafas por ninguna parte.',
          hint: 'encontrar',
          answers: ['encuentra'],
          explanation: 'O → UE: encontrar → él encuentra.',
        },
        {
          sentence: 'Perdóname, no {{1}} ir contigo a la fiesta.',
          hint: 'poder',
          answers: ['puedo'],
          explanation: 'O → UE: poder → yo puedo.',
        },
        {
          sentence: 'Nosotros {{1}} más los domingos.',
          hint: 'dormir',
          answers: ['dormimos'],
          explanation: 'Nosotros — без зміни кореня: dormir → dormimos.',
        },
        {
          sentence: 'Mis padres nunca {{1}} comidas que no conocen.',
          hint: 'probar',
          answers: ['prueban'],
          explanation: 'O → UE: probar → ellos prueban.',
        },
        {
          sentence: 'Disculpe, ¿cuánto {{1}} estos zapatos?',
          hint: 'costar',
          answers: ['cuestan'],
          explanation: 'O → UE: costar → cuestan (ellos).',
        },
        {
          sentence: 'Yo no {{1}} el apellido de Luisa. ¿Tú lo {{2}}?',
          hint: 'recordar',
          answers: ['recuerdo', 'recuerdas'],
          explanation: 'O → UE: recordar → yo recuerdo, tú recuerdas.',
        },
        {
          sentence: 'Señor López, ¿ {{1}} ayudarme un momento?',
          hint: 'poder',
          answers: ['puede'],
          explanation: 'O → UE: poder → usted puede.',
        },
        {
          sentence: 'Esos pájaros {{1}} muy alto.',
          hint: 'volar',
          answers: ['vuelan'],
          explanation: 'O → UE: volar → ellos vuelan.',
        },
        {
          sentence: 'Mis alumnos {{1}} del 1 al 100 en inglés.',
          hint: 'contar',
          answers: ['cuentan'],
          explanation: 'O → UE: contar → ellos cuentan.',
        },
        {
          sentence: '¿Vosotros {{1}} vuestros cuadros en esta exposición de pintura?',
          hint: 'mostrar',
          answers: ['mostráis'],
          explanation: 'Vosotros — без зміни кореня: mostrar → mostráis.',
        },
      ]),
    ],
  },

  // ===== Clase 2. Repaso del presente =====
  {
    title: 'Clase 2. Repaso del presente',
    blocks: [
      text(`
<h2>Повторення теперішнього часу (Presente de Indicativo)</h2>
<p>У цьому уроці повторюємо три групи правильних дієслів та основні неправильні дієслова.</p>
<h3>Правильні дієслова: три групи</h3>
<table>
  <tr><th></th><th>-AR (hablar)</th><th>-ER (comer)</th><th>-IR (vivir)</th></tr>
  <tr><td>yo</td><td>habl<strong>o</strong></td><td>com<strong>o</strong></td><td>viv<strong>o</strong></td></tr>
  <tr><td>tú</td><td>habl<strong>as</strong></td><td>com<strong>es</strong></td><td>viv<strong>es</strong></td></tr>
  <tr><td>él/ella</td><td>habl<strong>a</strong></td><td>com<strong>e</strong></td><td>viv<strong>e</strong></td></tr>
  <tr><td>nosotros</td><td>habl<strong>amos</strong></td><td>com<strong>emos</strong></td><td>viv<strong>imos</strong></td></tr>
  <tr><td>ellos</td><td>habl<strong>an</strong></td><td>com<strong>en</strong></td><td>viv<strong>en</strong></td></tr>
</table>
<h3>Ключові неправильні дієслова</h3>
<ul>
  <li><strong>ser:</strong> soy, eres, es, somos, son</li>
  <li><strong>estar:</strong> estoy, estás, está, estamos, están</li>
  <li><strong>ir:</strong> voy, vas, va, vamos, van</li>
  <li><strong>tener:</strong> tengo, tienes, tiene, tenemos, tienen</li>
  <li><strong>hacer:</strong> hago, haces, hace, hacemos, hacen</li>
</ul>
<h3>Правила читання (повторення)</h3>
<ul>
  <li><strong>H</strong> — завжди німа: hola [о́ла], hacer [асе́р]</li>
  <li><strong>J</strong> — як українське "х": julio [ху́ліо]</li>
  <li><strong>Ñ</strong> — як "нь": España [еспа́нья]</li>
  <li><strong>LL</strong> — як "й" або "ль": llamar [йяма́р]</li>
  <li><strong>V</strong> — вимовляється як "б": vivir [бібі́р]</li>
</ul>
      `),
      cards([
        { front: 'hablar', back: 'говорити', transcription: '[абла́р]' },
        { front: 'comer', back: 'їсти', transcription: '[коме́р]' },
        { front: 'vivir', back: 'жити', transcription: '[бібі́р]' },
        { front: 'ser', back: 'бути (постійно)', transcription: '[сер]' },
        { front: 'estar', back: 'бути (стан/місце)', transcription: '[еста́р]' },
        { front: 'ir', back: 'йти / їхати', transcription: '[ір]' },
        { front: 'tener', back: 'мати', transcription: '[тене́р]' },
        { front: 'hacer', back: 'робити', transcription: '[асе́р]' },
        { front: 'saber', back: 'знати', transcription: '[сабе́р]' },
        { front: 'decir', back: 'говорити / казати', transcription: '[десі́р]' },
      ]),
      quiz([
        {
          text: 'Як правильно: "Nosotros ___ español." (Ми говоримо іспанською.)',
          options: ['hablamos', 'hablan', 'hablas', 'hablo'],
          correct_index: 0,
          explanation: 'Nosotros + -ar → hablamos.',
        },
        {
          text: 'Оберіть правильну форму: "Yo ___ en Kyiv." (Я живу в Києві.)',
          options: ['vives', 'vivir', 'vivo', 'vivimos'],
          correct_index: 2,
          explanation: 'Yo + vivir → vivo.',
        },
        {
          text: '"Ellas ___ profesoras." (Вони вчительки.) — ser чи estar?',
          options: ['están', 'son', 'estamos', 'somos'],
          correct_index: 1,
          explanation: 'Професія — постійна характеристика → ser. Ellas son profesoras.',
        },
        {
          text: '"Tú ___ 25 años." (Тобі 25 років.)',
          options: ['eres', 'tienes', 'estás', 'haces'],
          correct_index: 1,
          explanation: 'Вік в іспанській виражається через "tener": Tú tienes 25 años.',
        },
      ]),
    ],
  },

  // ===== Clase 3. Días de la semana y los meses =====
  {
    title: 'Clase 3. Los días, los meses y los números',
    blocks: [
      text(`
<h2>Дні тижня, місяці та числа</h2>
<p>В іспанській мові дні тижня та місяці пишуться з <strong>маленької літери</strong>.</p>
<h3>Дні тижня (los días de la semana)</h3>
<p><strong>lunes</strong> (понеділок), <strong>martes</strong> (вівторок), <strong>miércoles</strong> (середа), <strong>jueves</strong> (четвер), <strong>viernes</strong> (п'ятниця), <strong>sábado</strong> (субота), <strong>domingo</strong> (неділя)</p>
<h3>Місяці (los meses del año)</h3>
<p><strong>enero</strong> (січень), <strong>febrero</strong> (лютий), <strong>marzo</strong> (березень), <strong>abril</strong> (квітень), <strong>mayo</strong> (травень), <strong>junio</strong> (червень), <strong>julio</strong> (липень), <strong>agosto</strong> (серпень), <strong>septiembre</strong> (вересень), <strong>octubre</strong> (жовтень), <strong>noviembre</strong> (листопад), <strong>diciembre</strong> (грудень)</p>
<h3>Пори року (las estaciones)</h3>
<ul>
  <li><strong>la primavera</strong> — весна</li>
  <li><strong>el verano</strong> — літо</li>
  <li><strong>el otoño</strong> — осінь</li>
  <li><strong>el invierno</strong> — зима</li>
</ul>
<h3>Числа 1–1000 (повторення)</h3>
<p><strong>1</strong> uno, <strong>2</strong> dos, <strong>3</strong> tres, <strong>10</strong> diez, <strong>15</strong> quince, <strong>20</strong> veinte, <strong>30</strong> treinta, <strong>40</strong> cuarenta, <strong>50</strong> cincuenta, <strong>100</strong> cien, <strong>200</strong> doscientos, <strong>500</strong> quinientos, <strong>1000</strong> mil</p>
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
        { front: 'abril', back: 'квітень', transcription: '[абрі́ль]' },
        { front: 'julio', back: 'липень', transcription: '[ху́ліо]' },
        { front: 'octubre', back: 'жовтень', transcription: '[окту́бре]' },
        { front: 'la primavera', back: 'весна', transcription: '[ла прімабе́ра]' },
        { front: 'el verano', back: 'літо', transcription: '[ель бера́но]' },
        { front: 'el otoño', back: 'осінь', transcription: '[ель ото́ньо]' },
        { front: 'el invierno', back: 'зима', transcription: '[ель інбьє́рно]' },
      ]),
      quiz([
        {
          text: 'Який день тижня — "jueves"?',
          options: ['Вівторок', 'Середа', 'Четвер', "П'ятниця"],
          correct_index: 2,
          explanation: 'Jueves = четвер.',
        },
        {
          text: 'Як іспанською "квітень"?',
          options: ['agosto', 'abril', 'octubre', 'mayo'],
          correct_index: 1,
          explanation: 'Abril = квітень.',
        },
        {
          text: 'Яка пора року — "el otoño"?',
          options: ['Весна', 'Літо', 'Осінь', 'Зима'],
          correct_index: 2,
          explanation: 'El otoño = осінь.',
        },
        {
          text: 'Як іспанською число 500?',
          options: ['cincocientos', 'quinientos', 'quinhentos', 'cincientos'],
          correct_index: 1,
          explanation: 'Quinientos = 500. Це неправильна форма (не cincocientos).',
        },
      ]),
    ],
  },

  // ===== Clase 4. Preguntas para conocernos =====
  {
    title: 'Clase 4. Preguntas para conocernos',
    blocks: [
      text(`
<h2>Питальні слова та знайомство</h2>
<p>Щоб вести розмову іспанською, потрібно вміти ставити запитання. У цьому уроці вивчимо основні питальні слова та фрази для знайомства.</p>
<h3>Питальні слова (las palabras interrogativas)</h3>
<ul>
  <li><strong>¿Qué?</strong> — Що? Який?</li>
  <li><strong>¿Quién? / ¿Quiénes?</strong> — Хто?</li>
  <li><strong>¿Dónde?</strong> — Де?</li>
  <li><strong>¿Cuándo?</strong> — Коли?</li>
  <li><strong>¿Cómo?</strong> — Як?</li>
  <li><strong>¿Cuánto/a? / ¿Cuántos/as?</strong> — Скільки?</li>
  <li><strong>¿Por qué?</strong> — Чому?</li>
  <li><strong>¿Cuál? / ¿Cuáles?</strong> — Який? (з вибором)</li>
</ul>
<h3>Фрази для знайомства</h3>
<ul>
  <li><strong>¿Cómo te llamas?</strong> — Як тебе звати?</li>
  <li><strong>¿De dónde eres?</strong> — Звідки ти?</li>
  <li><strong>¿Dónde vives?</strong> — Де ти живеш?</li>
  <li><strong>¿Cuántos años tienes?</strong> — Скільки тобі років?</li>
  <li><strong>¿A qué te dedicas?</strong> — Чим ти займаєшся?</li>
  <li><strong>¿Qué idiomas hablas?</strong> — Якими мовами ти розмовляєш?</li>
  <li><strong>¿Tienes hermanos?</strong> — У тебе є брати/сестри?</li>
  <li><strong>¿Cuál es tu número de teléfono?</strong> — Який твій номер телефону?</li>
  <li><strong>¿Cuál es tu correo electrónico?</strong> — Яка твоя електронна пошта?</li>
</ul>
<h3>Корисна лексика</h3>
<ul>
  <li><strong>arroba</strong> — @ (символ "равлик")</li>
  <li><strong>punto</strong> — крапка</li>
  <li><strong>guion</strong> — дефіс</li>
</ul>
      `),
      cards([
        { front: '¿Qué?', back: 'Що? Який?', transcription: '[ке]' },
        { front: '¿Quién?', back: 'Хто?', transcription: '[кьєн]' },
        { front: '¿Dónde?', back: 'Де?', transcription: '[до́нде]' },
        { front: '¿Cuándo?', back: 'Коли?', transcription: '[куа́ндо]' },
        { front: '¿Cómo?', back: 'Як?', transcription: '[ко́мо]' },
        { front: '¿Cuánto?', back: 'Скільки?', transcription: '[куа́нто]' },
        { front: '¿Por qué?', back: 'Чому?', transcription: '[пор ке]' },
        { front: '¿Cuál?', back: 'Який? (з вибором)', transcription: '[куа́ль]' },
        {
          front: '¿A qué te dedicas?',
          back: 'Чим ти займаєшся?',
          transcription: '[а ке те деді́кас]',
        },
        {
          front: '¿Cuál es tu correo electrónico?',
          back: 'Яка твоя електронна пошта?',
          transcription: '[куа́ль ес ту корре́о електро́ніко]',
        },
        { front: 'arroba', back: '@ (равлик)', transcription: '[арро́ба]' },
        { front: 'punto', back: 'крапка', transcription: '[пу́нто]' },
      ]),
      quiz([
        {
          text: 'Яке питальне слово означає "Де?"?',
          options: ['¿Cuándo?', '¿Cómo?', '¿Dónde?', '¿Qué?'],
          correct_index: 2,
          explanation: '¿Dónde? = Де? ¿Cuándo? = Коли? ¿Cómo? = Як?',
        },
        {
          text: 'Як запитати "Скільки тобі років?"?',
          options: [
            '¿Cuántos años eres?',
            '¿Cuántos años tienes?',
            '¿Cuántos años estás?',
            '¿Qué años tienes?',
          ],
          correct_index: 1,
          explanation: 'Вік виражається через "tener": ¿Cuántos años tienes?',
        },
        {
          text: 'Яка різниця між "¿Qué?" і "¿Cuál?"?',
          options: [
            'Немає різниці',
            '¿Qué? — що/який (визначення), ¿Cuál? — який (з вибору)',
            '¿Qué? для людей, ¿Cuál? для речей',
            '¿Cuál? — тільки для чисел',
          ],
          correct_index: 1,
          explanation: '¿Qué? запитує визначення, ¿Cuál? — вибір з варіантів.',
        },
        {
          text: 'Як іспанською сказати символ "@"?',
          options: ['punto', 'guion', 'arroba', 'barra'],
          correct_index: 2,
          explanation: 'Arroba = @, punto = крапка, guion = дефіс.',
        },
      ]),
    ],
  },

  // ===== Clase 5. Repaso de los temas =====
  {
    title: 'Clase 5. Repaso de los temas',
    blocks: [
      text(`
<h2>Повторення тем 1–4</h2>
<p>У цьому уроці повторюємо весь пройдений матеріал: неправильні дієслова, теперішній час, дні тижня та місяці, питальні слова.</p>
<h3>Ключові моменти</h3>
<ul>
  <li><strong>Неправильні дієслова:</strong> O→UE (poder, dormir, volver), E→IE (querer, pensar, preferir), E→I (pedir, repetir)</li>
  <li><strong>Три групи дієслів:</strong> -AR (hablar → hablo), -ER (comer → como), -IR (vivir → vivo)</li>
  <li><strong>Ser vs Estar:</strong> ser — постійне (національність, професія), estar — тимчасове (стан, місце)</li>
  <li><strong>Tener:</strong> вік (tengo 25 años), стани (tengo hambre — я голодний)</li>
</ul>
<h3>Діалог-приклад</h3>
<p><em>— ¡Hola! ¿Cómo te llamas?</em><br/>
— Me llamo Oleksandra. ¿Y tú?<br/>
<em>— Soy Carmen. ¿De dónde eres?</em><br/>
— Soy de Ucrania, de Kyiv. ¿Y tú?<br/>
<em>— Soy de Madrid. ¿Cuántos años tienes?</em><br/>
— Tengo veinticinco años. ¿A qué te dedicas?<br/>
<em>— Soy profesora de español. ¿Y tú?</em><br/>
— Soy diseñadora. Estudio español los jueves.</p>
      `),
      quiz([
        {
          text: 'Оберіть правильну форму: "Yo ___ 25 años."',
          options: ['soy', 'tengo', 'estoy', 'hago'],
          correct_index: 1,
          explanation: 'Вік = tener: Yo tengo 25 años.',
        },
        {
          text: '"Nosotros ___ de Ucrania." — ser чи estar?',
          options: ['estamos', 'somos', 'tenemos', 'vamos'],
          correct_index: 1,
          explanation: 'Походження — постійне → ser: Nosotros somos de Ucrania.',
        },
        {
          text: '"Ella ___ en la oficina." — ser чи estar?',
          options: ['es', 'está', 'tiene', 'va'],
          correct_index: 1,
          explanation: 'Місцезнаходження → estar: Ella está en la oficina.',
        },
        {
          text: '"¿Qué idiomas ___?" (Якими мовами ти розмовляєш?)',
          options: ['hablas', 'hablan', 'hablamos', 'habla'],
          correct_index: 0,
          explanation: 'Tú hablas — ти розмовляєш.',
        },
        {
          text: 'Як перекласти "Я вивчаю іспанську щочетверга"?',
          options: [
            'Estudio español los jueves.',
            'Estudio español el jueves.',
            'Estoy español los jueves.',
            'Aprendo español jueves.',
          ],
          correct_index: 0,
          explanation:
            '"Los + день тижня" означає регулярну дію (щотижня). "El jueves" = цього четверга.',
        },
      ]),
    ],
  },

  // ===== Clases 6-7. Mi tiempo libre. El verbo GUSTAR =====
  {
    title: 'Clases 6-7. Mi tiempo libre. El verbo GUSTAR',
    blocks: [
      text(`
<h2>Вільний час та дієслово GUSTAR</h2>
<p>Дієслово <strong>gustar</strong> (подобатися) працює зовсім інакше, ніж українське "подобатися". В іспанській суб'єктом є те, що подобається, а не той, кому подобається.</p>
<h3>Конструкція з GUSTAR</h3>
<table>
  <tr><th>Займенник</th><th>+ gusta (однина)</th><th>+ gustan (множина)</th></tr>
  <tr><td><strong>me</strong> (мені)</td><td>me gusta el café</td><td>me gustan los gatos</td></tr>
  <tr><td><strong>te</strong> (тобі)</td><td>te gusta bailar</td><td>te gustan las flores</td></tr>
  <tr><td><strong>le</strong> (йому/їй)</td><td>le gusta la música</td><td>le gustan los libros</td></tr>
  <tr><td><strong>nos</strong> (нам)</td><td>nos gusta viajar</td><td>nos gustan las películas</td></tr>
  <tr><td><strong>les</strong> (їм)</td><td>les gusta el fútbol</td><td>les gustan los deportes</td></tr>
</table>
<h3>Правила</h3>
<ul>
  <li><strong>gusta</strong> + іменник в однині або інфінітив: <em>Me gusta el chocolate. Me gusta leer.</em></li>
  <li><strong>gustan</strong> + іменник у множині: <em>Me gustan las películas españolas.</em></li>
  <li>Заперечення: <strong>no</strong> перед займенником: <em>No me gusta el frío.</em></li>
</ul>
<h3>Лексика: вільний час</h3>
<ul>
  <li><strong>leer</strong> — читати</li>
  <li><strong>bailar</strong> — танцювати</li>
  <li><strong>cocinar</strong> — готувати їжу</li>
  <li><strong>viajar</strong> — подорожувати</li>
  <li><strong>escuchar música</strong> — слухати музику</li>
  <li><strong>ver películas</strong> — дивитися фільми</li>
  <li><strong>jugar al fútbol</strong> — грати у футбол</li>
  <li><strong>pasear</strong> — гуляти</li>
  <li><strong>hacer deporte</strong> — займатися спортом</li>
  <li><strong>ir de compras</strong> — ходити за покупками</li>
</ul>
      `),
      cards([
        { front: 'Me gusta...', back: 'Мені подобається...', transcription: '[ме ґу́ста]' },
        { front: 'No me gusta...', back: 'Мені не подобається...', transcription: '[но ме ґу́ста]' },
        { front: 'leer', back: 'читати', transcription: '[ле́ер]' },
        { front: 'bailar', back: 'танцювати', transcription: '[байла́р]' },
        { front: 'cocinar', back: 'готувати їжу', transcription: '[косіна́р]' },
        { front: 'viajar', back: 'подорожувати', transcription: '[бьяха́р]' },
        { front: 'escuchar música', back: 'слухати музику', transcription: '[ескуча́р му́сіка]' },
        { front: 'ver películas', back: 'дивитися фільми', transcription: '[бер пелі́кулас]' },
        { front: 'pasear', back: 'гуляти', transcription: '[пасеа́р]' },
        { front: 'hacer deporte', back: 'займатися спортом', transcription: '[асе́р депо́рте]' },
        { front: 'ir de compras', back: 'ходити за покупками', transcription: '[ір де ко́мпрас]' },
        { front: 'jugar al fútbol', back: 'грати у футбол', transcription: '[хуґа́р аль фу́тболь]' },
      ]),
      quiz([
        {
          text: 'Як правильно: "Me ___ los gatos." (Мені подобаються коти.)',
          options: ['gusta', 'gustan', 'gusto', 'gustas'],
          correct_index: 1,
          explanation: 'Los gatos — множина → gustan. Me gustan los gatos.',
        },
        {
          text: '"A ella le ___ bailar." (Їй подобається танцювати.)',
          options: ['gustan', 'gusta', 'gustamos', 'gustas'],
          correct_index: 1,
          explanation: 'Bailar — інфінітив → gusta. Le gusta bailar.',
        },
        {
          text: 'Як сказати "Нам не подобається холод"?',
          options: [
            'No nos gustan el frío.',
            'No nos gusta el frío.',
            'Nos no gusta el frío.',
            'No gusta nos el frío.',
          ],
          correct_index: 1,
          explanation:
            'El frío — однина → gusta. "No" стоїть перед займенником: No nos gusta el frío.',
        },
        {
          text: 'Як перекласти "Тобі подобаються іспанські фільми"?',
          options: [
            'Te gusta las películas españolas.',
            'Te gustan las películas españolas.',
            'Tu gustas las películas españolas.',
            'Te gustan los películas españolas.',
          ],
          correct_index: 1,
          explanation: 'Las películas — множина, жіночий рід → te gustan las películas españolas.',
        },
      ]),
    ],
  },

  // ===== Clase 8. La comida =====
  {
    title: 'Clase 8. La comida',
    blocks: [
      text(`
<h2>Їжа (La comida)</h2>
<p>Лексика їжі — одна з найпрактичніших тем. У цьому уроці вивчаємо назви продуктів, страв та корисні фрази для ресторану.</p>
<h3>Прийоми їжі</h3>
<ul>
  <li><strong>el desayuno</strong> — сніданок</li>
  <li><strong>el almuerzo / la comida</strong> — обід</li>
  <li><strong>la merienda</strong> — полуденок (перекус)</li>
  <li><strong>la cena</strong> — вечеря</li>
</ul>
<h3>Продукти (los alimentos)</h3>
<ul>
  <li><strong>el pan</strong> — хліб</li>
  <li><strong>el queso</strong> — сир</li>
  <li><strong>el jamón</strong> — хамон (в'ялена шинка)</li>
  <li><strong>el huevo</strong> — яйце</li>
  <li><strong>el arroz</strong> — рис</li>
  <li><strong>la pasta</strong> — паста</li>
  <li><strong>el pollo</strong> — курка</li>
  <li><strong>el pescado</strong> — риба</li>
  <li><strong>la carne</strong> — м'ясо</li>
  <li><strong>la leche</strong> — молоко</li>
</ul>
<h3>Напої (las bebidas)</h3>
<ul>
  <li><strong>el agua</strong> — вода</li>
  <li><strong>el café</strong> — кава</li>
  <li><strong>el té</strong> — чай</li>
  <li><strong>el zumo / el jugo</strong> — сік</li>
  <li><strong>la cerveza</strong> — пиво</li>
  <li><strong>el vino</strong> — вино</li>
</ul>
<h3>У ресторані</h3>
<ul>
  <li><strong>Quisiera…</strong> — Я б хотів/ла…</li>
  <li><strong>Para mí…</strong> — Для мене…</li>
  <li><strong>La cuenta, por favor.</strong> — Рахунок, будь ласка.</li>
  <li><strong>¿Qué me recomienda?</strong> — Що порекомендуєте?</li>
</ul>
      `),
      cards([
        { front: 'el desayuno', back: 'сніданок', transcription: '[ель десаю́но]' },
        { front: 'el almuerzo', back: 'обід', transcription: '[ель альмуе́рсо]' },
        { front: 'la cena', back: 'вечеря', transcription: '[ла се́на]' },
        { front: 'el pan', back: 'хліб', transcription: '[ель пан]' },
        { front: 'el queso', back: 'сир', transcription: '[ель ке́со]' },
        { front: 'el jamón', back: 'хамон', transcription: '[ель хамо́н]' },
        { front: 'el huevo', back: 'яйце', transcription: '[ель уе́бо]' },
        { front: 'el arroz', back: 'рис', transcription: '[ель арро́с]' },
        { front: 'el pollo', back: 'курка', transcription: '[ель по́льо]' },
        { front: 'el pescado', back: 'риба', transcription: '[ель песка́до]' },
        { front: 'la leche', back: 'молоко', transcription: '[ла ле́че]' },
        { front: 'el café', back: 'кава', transcription: '[ель кафе́]' },
        { front: 'el zumo', back: 'сік', transcription: '[ель су́мо]' },
        { front: 'la cerveza', back: 'пиво', transcription: '[ла серве́са]' },
      ]),
      quiz([
        {
          text: 'Як іспанською "сніданок"?',
          options: ['la cena', 'el almuerzo', 'el desayuno', 'la merienda'],
          correct_index: 2,
          explanation: 'El desayuno = сніданок. La cena = вечеря. El almuerzo = обід.',
        },
        {
          text: 'Що означає "el queso"?',
          options: ['Хліб', 'Сир', 'Масло', "М'ясо"],
          correct_index: 1,
          explanation: 'El queso = сир.',
        },
        {
          text: 'Як ввічливо замовити в ресторані?',
          options: ['Dame un café.', 'Quisiera un café, por favor.', 'Necesito café.', '¡Café!'],
          correct_index: 1,
          explanation: '"Quisiera" — ввічлива форма замовлення.',
        },
        {
          text: 'Як іспанською "рис"?',
          options: ['el arroz', 'la pasta', 'el pan', 'el maíz'],
          correct_index: 0,
          explanation: 'El arroz = рис.',
        },
      ]),
    ],
  },

  // ===== Clase 9. La fruta y la verdura =====
  {
    title: 'Clase 9. La fruta y la verdura',
    blocks: [
      text(`
<h2>Фрукти та овочі</h2>
<p>Продовжуємо тему їжі. У цьому уроці вивчаємо назви фруктів та овочів — корисна лексика для покупок на ринку та в супермаркеті.</p>
<h3>Фрукти (las frutas)</h3>
<ul>
  <li><strong>la manzana</strong> — яблуко</li>
  <li><strong>la naranja</strong> — апельсин</li>
  <li><strong>el plátano</strong> — банан</li>
  <li><strong>la fresa</strong> — полуниця</li>
  <li><strong>la uva</strong> — виноград</li>
  <li><strong>el limón</strong> — лимон</li>
  <li><strong>la sandía</strong> — кавун</li>
  <li><strong>el melocotón</strong> — персик</li>
  <li><strong>la pera</strong> — груша</li>
  <li><strong>la piña</strong> — ананас</li>
  <li><strong>la cereza</strong> — вишня</li>
  <li><strong>el mango</strong> — манго</li>
</ul>
<h3>Овочі (las verduras)</h3>
<ul>
  <li><strong>el tomate</strong> — помідор</li>
  <li><strong>la cebolla</strong> — цибуля</li>
  <li><strong>el ajo</strong> — часник</li>
  <li><strong>la patata / la papa</strong> — картопля</li>
  <li><strong>la zanahoria</strong> — морква</li>
  <li><strong>el pepino</strong> — огірок</li>
  <li><strong>el pimiento</strong> — перець</li>
  <li><strong>la lechuga</strong> — салат (листовий)</li>
  <li><strong>el brócoli</strong> — броколі</li>
  <li><strong>la calabaza</strong> — гарбуз</li>
</ul>
<h3>Корисні фрази на ринку</h3>
<ul>
  <li><strong>¿Cuánto cuesta un kilo de…?</strong> — Скільки коштує кілограм…?</li>
  <li><strong>Quiero medio kilo de tomates.</strong> — Хочу півкіло помідорів.</li>
  <li><strong>¿Tiene…?</strong> — У вас є…?</li>
  <li><strong>Está muy fresco/a.</strong> — Дуже свіже/а.</li>
</ul>
      `),
      cards([
        { front: 'la manzana', back: 'яблуко', transcription: '[ла мансáна]' },
        { front: 'la naranja', back: 'апельсин', transcription: '[ла наráнха]' },
        { front: 'el plátano', back: 'банан', transcription: '[ель плáтано]' },
        { front: 'la fresa', back: 'полуниця', transcription: '[ла фрéса]' },
        { front: 'la uva', back: 'виноград', transcription: '[ла ýва]' },
        { front: 'el limón', back: 'лимон', transcription: '[ель лімóн]' },
        { front: 'la sandía', back: 'кавун', transcription: '[ла сандía]' },
        { front: 'el tomate', back: 'помідор', transcription: '[ель томáте]' },
        { front: 'la cebolla', back: 'цибуля', transcription: '[ла себóлья]' },
        { front: 'el ajo', back: 'часник', transcription: '[ель áхо]' },
        { front: 'la patata', back: 'картопля', transcription: '[ла патáта]' },
        { front: 'la zanahoria', back: 'морква', transcription: '[ла санаóрія]' },
        { front: 'el pepino', back: 'огірок', transcription: '[ель пепíно]' },
        { front: 'el pimiento', back: 'перець', transcription: '[ель пімьéнто]' },
        { front: 'la lechuga', back: 'салат (листовий)', transcription: '[ла лечýга]' },
      ]),
      quiz([
        {
          text: 'Як іспанською "яблуко"?',
          options: ['la naranja', 'la manzana', 'la pera', 'la fresa'],
          correct_index: 1,
          explanation: 'La manzana = яблуко. La naranja = апельсин. La pera = груша.',
        },
        {
          text: 'Що означає "la cebolla"?',
          options: ['Часник', 'Морква', 'Цибуля', 'Картопля'],
          correct_index: 2,
          explanation: 'La cebolla = цибуля. El ajo = часник.',
        },
        {
          text: 'Як запитати ціну на ринку?',
          options: [
            '¿Cuánto cuesta un kilo de…?',
            '¿Qué precio tiene…?',
            '¿Cuántos euros…?',
            'Обидва перші варіанти правильні',
          ],
          correct_index: 3,
          explanation: 'Обидві фрази використовуються для запитання ціни.',
        },
        {
          text: 'Яке слово означає "кавун"?',
          options: ['el melón', 'la sandía', 'la calabaza', 'la piña'],
          correct_index: 1,
          explanation: 'La sandía = кавун. El melón = диня. La calabaza = гарбуз.',
        },
        {
          text: '"Quiero medio kilo de fresas." Що це означає?',
          options: [
            'Хочу кілограм полуниці.',
            'Хочу півкіло полуниці.',
            'Хочу трохи полуниці.',
            'Хочу свіжу полуницю.',
          ],
          correct_index: 1,
          explanation: '"Medio kilo" = півкіло. "Fresas" = полуниці.',
        },
      ]),
    ],
  },
]

// ---------------------------------------------------------------------------
// Schedule: build 4 weeks of classes starting from the next Thursday
// ---------------------------------------------------------------------------

function getThursday(weeksFromNow: number): Date {
  const now = new Date()
  // Find this week's Thursday
  const day = now.getDay() // 0=Sun, 4=Thu
  const diffToThursday = 4 - day
  const thursday = new Date(now)
  thursday.setDate(now.getDate() + diffToThursday + weeksFromNow * 7)
  thursday.setHours(18, 0, 0, 0) // 18:00 local
  return thursday
}

function buildSchedule(teacherProfileId: string, lessonIds: string[]) {
  const sessions = []

  // Past 8 Thursdays — one per completed lesson (Clases 1-8 already happened)
  for (let i = 0; i < lessonIds.length; i++) {
    const weeksBack = -(lessonIds.length - i) // -8, -7, -6, ..., -1
    const date = getThursday(weeksBack)

    sessions.push({
      id: randomUUID(),
      school_id: schoolId,
      lesson_id: lessonIds[i],
      teacher_id: teacherProfileId,
      title: `Clase ${i + 1}. Заняття A1`,
      scheduled_at: date.toISOString(),
      duration_minutes: 60,
      notes: null,
    })
  }

  // This week's Thursday (Clase 9 — current)
  const thisThursday = getThursday(0)
  sessions.push({
    id: randomUUID(),
    school_id: schoolId,
    lesson_id: null,
    teacher_id: teacherProfileId,
    title: 'Clase 9. Repaso general',
    scheduled_at: thisThursday.toISOString(),
    duration_minutes: 60,
    notes: 'Repaso de los temas 1-8',
  })

  // Next 3 Thursdays (future classes)
  for (let week = 1; week <= 3; week++) {
    const date = getThursday(week)
    sessions.push({
      id: randomUUID(),
      school_id: schoolId,
      lesson_id: null,
      teacher_id: teacherProfileId,
      title: `Clase ${9 + week}. Заняття A1`,
      scheduled_at: date.toISOString(),
      duration_minutes: 60,
      notes: week === 3 ? 'Prueba de progreso (міні-тест)' : null,
    })
  }

  return sessions
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'yes')
    })
  })
}

async function main() {
  console.log('=== Verbify Demo Seed ===\n')

  console.log('This will WIPE ALL DATA in the database and re-seed with demo data.')
  console.log(`Target: ${supabaseUrl}\n`)

  const ok = await confirm('Type "yes" to continue: ')
  if (!ok) {
    console.log('Aborted.')
    process.exit(0)
  }

  console.log('')

  // -----------------------------------------------------------------------
  // Step 1: Wipe all data
  // -----------------------------------------------------------------------
  console.log('1. Wiping all data...')

  // Delete in dependency order
  const tablesToClear = [
    'session_reminders',
    'class_sessions',
    'lesson_teachers',
    'homework_submissions',
    'homework_assignments',
    'homework_meta',
    'lesson_completions',
    'student_progress',
    'lesson_blocks',
    'enrollments',
    'lessons',
    'courses',
    'profiles',
    'schools',
  ]

  for (const table of tablesToClear) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      console.warn(`  Warning clearing ${table}: ${error.message}`)
    } else {
      console.log(`  Cleared: ${table}`)
    }
  }

  // Delete all auth users
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  for (const user of authUsers?.users || []) {
    await supabase.auth.admin.deleteUser(user.id)
  }
  console.log(`  Deleted ${authUsers?.users?.length ?? 0} auth users`)

  // -----------------------------------------------------------------------
  // Step 2: Create school
  // -----------------------------------------------------------------------
  console.log('\n2. Creating school...')

  const { error: schoolError } = await supabase.from('schools').insert({
    id: schoolId,
    name: 'Spanish MK',
    slug: 'spanishmk',
    language: 'es',
    logo_url:
      'https://dbdnlbkcmdnmgmssoszv.supabase.co/storage/v1/object/public/school-logos/00000000-0000-0000-0000-000000000001/logo-mnx3uqo1.webp',
    primary_color: '#0802c1',
    custom_domain: 'spanishmk.vercel.app',
    color_scheme: 'custom',
    login_heading: 'Bienvenido a Spanish MK',
    login_subheading: 'Вивчай іспанську з нами',
    subscription_status: 'active',
    subscription_plan: 'pro',
  })
  if (schoolError) {
    console.error('Failed to create school:', schoolError.message)
    process.exit(1)
  }
  console.log('  School created: Spanish MK')

  // -----------------------------------------------------------------------
  // Step 3: Create users and profiles
  // -----------------------------------------------------------------------
  console.log('\n3. Creating users...')

  const profileIds: Record<string, string> = {}

  for (const user of users) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    })

    if (authError) {
      console.error(`  Failed to create ${user.email}:`, authError.message)
      continue
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        school_id: schoolId,
        role: user.role,
        full_name: user.fullName,
        permissions: user.permissions,
      })
      .select('id')
      .single()

    if (profileError) {
      console.error(`  Failed to create profile for ${user.email}:`, profileError.message)
    } else {
      profileIds[user.email] = profileData.id
      console.log(`  ${user.role.padEnd(8)} ${user.fullName} (${user.email})`)
    }
  }

  // -----------------------------------------------------------------------
  // Step 4: Create course
  // -----------------------------------------------------------------------
  console.log('\n4. Creating course...')

  const ownerProfileId = profileIds['maria@spanishmk.vercel.app']
  if (!ownerProfileId) {
    console.error('Owner profile not found, cannot create course.')
    process.exit(1)
  }

  course.created_by = ownerProfileId
  const { error: courseError } = await supabase.from('courses').insert(course)
  if (courseError) {
    console.error('Failed to create course:', courseError.message)
    process.exit(1)
  }
  console.log(`  Course: "${course.title}"`)

  // -----------------------------------------------------------------------
  // Step 5: Create lessons and blocks
  // -----------------------------------------------------------------------
  console.log('\n5. Creating lessons...')

  const lessonIds: string[] = []

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]
    const lessonId = randomUUID()
    lessonIds.push(lessonId)

    const { error: lessonError } = await supabase.from('lessons').insert({
      id: lessonId,
      course_id: courseId,
      school_id: schoolId,
      title: lesson.title,
      order_index: i,
      is_published: true,
      lesson_type: 'lesson',
      sequential_blocks: true,
      require_previous_completion: i > 0,
    })

    if (lessonError) {
      console.error(`  Failed: "${lesson.title}": ${lessonError.message}`)
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
      console.error(`  Blocks failed for "${lesson.title}": ${blocksError.message}`)
    } else {
      console.log(`  ${i + 1}/${lessons.length}: "${lesson.title}" (${blockRows.length} blocks)`)
    }
  }

  // -----------------------------------------------------------------------
  // Step 6: Assign teacher to lessons
  // -----------------------------------------------------------------------
  console.log('\n6. Assigning teacher to lessons...')

  const teacherAssignments = lessonIds.map((lessonId) => ({
    lesson_id: lessonId,
    teacher_id: ownerProfileId,
    school_id: schoolId,
  }))

  const { error: assignError } = await supabase.from('lesson_teachers').insert(teacherAssignments)
  if (assignError) {
    console.warn(`  Warning: ${assignError.message}`)
  } else {
    console.log(`  Assigned Марія Кривоніс to ${lessonIds.length} lessons`)
  }

  // -----------------------------------------------------------------------
  // Step 7: Enroll students
  // -----------------------------------------------------------------------
  console.log('\n7. Enrolling students...')

  const studentEmails = [
    'oleksandra@spanishmk.vercel.app',
    'andriy@spanishmk.vercel.app',
    'daryna@spanishmk.vercel.app',
    'maksym@spanishmk.vercel.app',
    'sofia@spanishmk.vercel.app',
  ]

  const enrollments = studentEmails
    .filter((email) => profileIds[email])
    .map((email) => ({
      student_id: profileIds[email],
      course_id: courseId,
      school_id: schoolId,
    }))

  const { error: enrollError } = await supabase.from('enrollments').insert(enrollments)
  if (enrollError) {
    console.error(`  Failed: ${enrollError.message}`)
  } else {
    console.log(`  Enrolled ${enrollments.length} students`)
  }

  // -----------------------------------------------------------------------
  // Step 8: Create some student progress (simulate Oleksandra being ahead)
  // -----------------------------------------------------------------------
  console.log('\n8. Creating student progress...')

  const oleksandraId = profileIds['oleksandra@spanishmk.vercel.app']
  const andriyId = profileIds['andriy@spanishmk.vercel.app']
  const darynaId = profileIds['daryna@spanishmk.vercel.app']

  // Fetch all blocks for progress simulation
  const { data: allBlocks } = await supabase
    .from('lesson_blocks')
    .select('id, lesson_id, type')
    .eq('school_id', schoolId)
    .order('order_index')

  if (allBlocks && oleksandraId) {
    // Oleksandra completed lessons 1-7 (she's the most active student)
    const completedLessonIds = lessonIds.slice(0, 7)
    const oleksandraBlocks = allBlocks.filter((b) => completedLessonIds.includes(b.lesson_id))

    const progressRows = oleksandraBlocks.map((block) => ({
      student_id: oleksandraId,
      lesson_id: block.lesson_id,
      block_id: block.id,
      school_id: schoolId,
      completed: true,
      score: block.type === 'quiz' ? Math.floor(Math.random() * 20) + 80 : null,
      attempts: block.type === 'quiz' ? Math.floor(Math.random() * 2) + 1 : 1,
      completed_at: new Date().toISOString(),
    }))

    const { error: progressError } = await supabase.from('student_progress').insert(progressRows)
    if (progressError) {
      console.warn(`  Oleksandra progress: ${progressError.message}`)
    } else {
      console.log(`  Олександра: ${progressRows.length} blocks completed (lessons 1-7)`)
    }

    // Mark completed lessons for Oleksandra
    const completionRows = completedLessonIds.map((lid) => ({
      student_id: oleksandraId,
      lesson_id: lid,
      school_id: schoolId,
    }))
    await supabase.from('lesson_completions').insert(completionRows)
  }

  // Andriy completed lessons 1-4
  if (allBlocks && andriyId) {
    const completedLessonIds = lessonIds.slice(0, 4)
    const andriyBlocks = allBlocks.filter((b) => completedLessonIds.includes(b.lesson_id))

    const progressRows = andriyBlocks.map((block) => ({
      student_id: andriyId,
      lesson_id: block.lesson_id,
      block_id: block.id,
      school_id: schoolId,
      completed: true,
      score: block.type === 'quiz' ? Math.floor(Math.random() * 30) + 60 : null,
      attempts: block.type === 'quiz' ? Math.floor(Math.random() * 3) + 1 : 1,
      completed_at: new Date().toISOString(),
    }))

    await supabase.from('student_progress').insert(progressRows)
    console.log(`  Андрій: ${progressRows.length} blocks completed (lessons 1-4)`)

    const completionRows = completedLessonIds.map((lid) => ({
      student_id: andriyId,
      lesson_id: lid,
      school_id: schoolId,
    }))
    await supabase.from('lesson_completions').insert(completionRows)
  }

  // Daryna completed lessons 1-2
  if (allBlocks && darynaId) {
    const completedLessonIds = lessonIds.slice(0, 2)
    const darynaBlocks = allBlocks.filter((b) => completedLessonIds.includes(b.lesson_id))

    const progressRows = darynaBlocks.map((block) => ({
      student_id: darynaId,
      lesson_id: block.lesson_id,
      block_id: block.id,
      school_id: schoolId,
      completed: true,
      score: block.type === 'quiz' ? Math.floor(Math.random() * 25) + 70 : null,
      attempts: block.type === 'quiz' ? Math.floor(Math.random() * 2) + 1 : 1,
      completed_at: new Date().toISOString(),
    }))

    await supabase.from('student_progress').insert(progressRows)
    console.log(`  Дарина: ${progressRows.length} blocks completed (lessons 1-2)`)

    const completionRows = completedLessonIds.map((lid) => ({
      student_id: darynaId,
      lesson_id: lid,
      school_id: schoolId,
    }))
    await supabase.from('lesson_completions').insert(completionRows)
  }

  // Maksym and Sofia: enrolled but no progress yet (new students)
  console.log('  Максим: enrolled, no progress yet')
  console.log('  Софія: enrolled, no progress yet')

  // -----------------------------------------------------------------------
  // Step 9: Create class schedule for next 4 weeks
  // -----------------------------------------------------------------------
  console.log('\n9. Creating class schedule (past + current + future)...')

  const scheduleSessions = buildSchedule(ownerProfileId, lessonIds)

  const { error: scheduleError } = await supabase.from('class_sessions').insert(scheduleSessions)
  if (scheduleError) {
    console.error(`  Failed: ${scheduleError.message}`)
  } else {
    for (const session of scheduleSessions) {
      const date = new Date(session.scheduled_at)
      console.log(
        `  ${date.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' })} 18:00 — ${session.title}`
      )
    }
  }

  // -----------------------------------------------------------------------
  // Done
  // -----------------------------------------------------------------------
  console.log('\n=== Demo seed complete! ===')
  console.log('\nLogin credentials (password: pw123456):')
  console.log('  Owner:   maria@spanishmk.vercel.app')
  console.log('  Teacher: carmen@spanishmk.vercel.app')
  console.log('  Student: oleksandra@spanishmk.vercel.app (7/8 lessons done)')
  console.log('  Student: andriy@spanishmk.vercel.app (4/8 lessons done)')
  console.log('  Student: daryna@spanishmk.vercel.app (2/8 lessons done)')
  console.log('  Student: maksym@spanishmk.vercel.app (new)')
  console.log('  Student: sofia@spanishmk.vercel.app (new)')
}

main()
