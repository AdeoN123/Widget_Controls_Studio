const FULL_KEY_LABELS: Record<string, string> = {
  title: 'Заголовок',
  subtitle: 'Подзаголовок',
  questions: 'Вопросы',
  arrow: 'Стрелка',
  rows: 'Строка',
  button_text: 'Текст кнопки',
  title_text: 'Заголовок',
  visible: 'Видимость',
  visibility_kind: 'Тип видимости',
  preview_url: 'URL превью',
  preview_image: 'Изображение превью',
  promo_end: 'Дата окончания акции',
  promo_end_data: 'Данные окончания акции',
  section_container: 'Тип контейнера',
  section_columns: 'Ширина блока',
  section_bg_image: 'Фоновое изображение',
  image_height: 'Максимальная высота',
  count_col: 'Количество столбцов',
  table_padding_top: 'Отступ сверху в ячейках',
  table_padding_bottom: 'Отступ снизу в ячейках',
  table_padding_sides: 'Отступ по бокам в ячейках',
  section_padding_top: 'Отступ сверху',
  section_padding_bottom: 'Отступ снизу',
  column_title: 'Заголовок столбца',
}

const SUFFIX_LABELS: [suffix: string, label: string][] = [
  ['_line_height', 'Межстрочный интервал'],
  ['_font_size', 'Размер шрифта'],
  ['_padding_top', 'Отступ сверху'],
  ['_padding_bottom', 'Отступ снизу'],
  ['_padding_left', 'Отступ слева'],
  ['_padding_right', 'Отступ справа'],
  ['_margin_top', 'Отступ сверху'],
  ['_margin_bottom', 'Отступ снизу'],
  ['_margin_left', 'Отступ слева'],
  ['_margin_right', 'Отступ справа'],
]

const WORD_LABELS: Record<string, string> = {
  section: 'Секция',
  padding: 'Отступ',
  margin: 'Отступ',
  top: 'Сверху',
  bottom: 'Снизу',
  left: 'Слева',
  right: 'Справа',
  sides: 'По бокам',
  color: 'Цвет',
  bg: 'Фон',
  background: 'Фон',
  image: 'Изображение',
  img: 'Изображение',
  file: 'Файл',
  font: 'Шрифт',
  family: 'Семейство',
  size: 'Размер',
  weight: 'Насыщенность',
  width: 'Ширина',
  height: 'Высота',
  radius: 'Радиус',
  border: 'Граница',
  align: 'Выравнивание',
  text: 'Текст',
  button: 'Кнопка',
  description: 'Описание',
  url: 'URL',
  kind: 'Тип',
  type: 'Тип',
  enabled: 'Включено',
  visibility: 'Видимость',
  max: 'Максимум',
  min: 'Минимум',
  count: 'Количество',
  column: 'Столбец',
  columns: 'Столбцы',
  row: 'Строка',
  rows: 'Строки',
  line: 'Линия',
  opacity: 'Прозрачность',
  shadow: 'Тень',
  link: 'Ссылка',
  icon: 'Иконка',
  hover: 'При наведении',
  gap: 'Промежуток',
  container: 'Контейнер',
  title: 'Заголовок',
  question: 'Вопрос',
  answer: 'Ответ',
  accordion: 'Аккордеон',
  table: 'Таблица',
  header: 'Заголовок',
  arrow: 'Стрелка',
}

function capitalizeWord(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/**
 * Переводит ключ поля (уже без префикса брейкпоинта) в русский лейбл, где
 * это возможно. Никогда не бросает исключение и никогда не возвращает
 * пустую строку — всё, что не покрыто словарями выше, откатывается на
 * исходный английский вариант с заглавной буквы, слово за словом, так что
 * непокрытые ключи деградируют плавно, а не ломаются.
 */
export function translateFieldKey(strippedKey: string): string {
  const exact = FULL_KEY_LABELS[strippedKey]
  if (exact) return exact

  const numbered = strippedKey.match(/^(.+)_(\d+)$/)
  if (numbered) {
    const [, numberedBase, index] = numbered
    const baseLabel = FULL_KEY_LABELS[numberedBase]
    if (baseLabel) return `${baseLabel} ${index}`
  }

  for (const [suffix, label] of SUFFIX_LABELS) {
    if (strippedKey.endsWith(suffix)) return label
  }

  const words = strippedKey.split('_').filter(Boolean)
  if (words.length === 0) return strippedKey

  return words.map((w) => WORD_LABELS[w.toLowerCase()] ?? capitalizeWord(w)).join(' ')
}
