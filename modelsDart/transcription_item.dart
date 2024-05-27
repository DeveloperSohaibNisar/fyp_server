class TranscriptionItem {
  final int id;
  final String text;
  final Duration start;
  final Duration end;

  TranscriptionItem(
      {required this.id,
      required this.text,
      required this.start,
      required this.end});
}
