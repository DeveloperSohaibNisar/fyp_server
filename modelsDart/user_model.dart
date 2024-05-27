import 'package:firebase_auth/firebase_auth.dart';

class UsersList {
  final int uid;
  final String userName;
  final DateTime creationDate;
  final String password;
  final bool isGuest;
  final String email;

  UsersList(
      {required this.uid,
        required this.userName,
        required this.creationDate,
        required this.password,
        required this.isGuest,
        required this.email});
}


class Users{

  List<UsersList> UsersData =[  ];
}