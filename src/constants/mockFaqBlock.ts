export const mockFaqBlock = `#Обязательное
preview_url: "/builder/images/icons/faq.png"
preview_image: "https://cdn.example.com/builder/images/widget-add/faq_1.jpg"
builder_template_kinds: ["checks", "codes", "microsite"]
scroll_to_enabled: true
visible: "true"
visibility_kind: "public"
w_type: "interactive"
custom_tablet_design: ""
custom_phone_design: ""
promo_end: "false"
promo_end_data: ""

#Контент
title: "Частые вопросы"
questions: [{title: "Кто является организатором промоакции?", text: "Организатором является компания..."}, {title: "Как долго будет длиться промоакция?", text: "Промоакция проводится с 1 по 30 число..."}]
arrow: "https://platform.example.com/files/example.svg"

#Общее
section_bg_color: "rgb(255, 255, 255)"
section_padding_top: "70"
section_padding_bottom: "70"

#Заголовок
title_font_size: "52"
tablet_title_font_size: "46"
phone_title_font_size: "27"
title_font_weight: "700"
title_text_align: "center"

#Аккордион
accordion_button_color: "#333333"
accordion_button_color_hover: "#4885ff"

#Вопрос
question_font_size: "18"
tablet_question_font_size: "16"
phone_question_font_size: "14"

#Текст
text_font_size: "16"
tablet_text_font_size: "14"
phone_text_font_size: "13"

#Контролы
widgets_controls: {title: {group: "Контент", name: "Заголовок", type: "textfield"}, questions: {group: "Контент", name: "Вопросы", type: "collection", template: {title: {name: "Вопрос", type: "textfield"}, text: {name: "Ответ", type: "wysiwyg"}}}, arrow: {group: "Контент", name: "Стрелка", type: "file", file_types: "svg,png", max_size: "1"}, section_bg_color: {group: "Общее", name: "Цвет фона секции", type: "color", builder_kind: "design-desktop"}, section_padding_top: {group: "Общее", name: "Отступ сверху", type: "textfield", validate: {required: "true", digits: "true"}, builder_kind: "design-desktop"}}
`
