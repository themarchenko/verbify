-- Add fill_in_blank block type to lesson_blocks
alter table lesson_blocks drop constraint lesson_blocks_type_check;
alter table lesson_blocks add constraint lesson_blocks_type_check
  check (type in ('text', 'flashcards', 'quiz', 'audio', 'video', 'embed', 'open_answer', 'file_upload', 'fill_in_blank'));
