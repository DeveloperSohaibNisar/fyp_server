class NoteListItem {
  final int id;
  final String title;
  final DateTime uploadDate;
  final DateTime updateDate;
  final int lines;

  NoteListItem(
      {required this.id,
      required this.title,
      required this.uploadDate,
      required this.updateDate,
      required this.lines});
}
