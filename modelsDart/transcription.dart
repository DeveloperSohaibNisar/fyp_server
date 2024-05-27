import 'package:fyp_application/models/transcription_item.dart';

class TranscriptionClass {
  final int id;
  final List<TranscriptionItem> data;
  final String audioUrl;
  final Duration audioLength;

  TranscriptionClass(
      {required this.id,
      required this.data,
      required this.audioUrl,
      required this.audioLength});
}
