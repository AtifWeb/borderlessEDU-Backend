export class Message {
  static log(messsage, data = null) {
    return data ? console.log(`${messsage}:`, data) : console.log(data);
  }
}
