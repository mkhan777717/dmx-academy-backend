class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }

  static deserialize(data) {
    if (!data) return null;
    const arr = typeof data === 'string' ? JSON.parse(data) : data;
    if (!arr || arr.length === 0) return null;

    const head = new ListNode(Number(arr[0]));
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
      curr.next = new ListNode(Number(arr[i]));
      curr = curr.next;
    }
    return head;
  }

  static serialize(head) {
    if (!head) return "[]";
    const res = [];
    let curr = head;
    while (curr) {
      res.push(curr.val);
      curr = curr.next;
    }
    return JSON.stringify(res);
  }
}

if (typeof module !== 'undefined') {
  module.exports = ListNode;
}
