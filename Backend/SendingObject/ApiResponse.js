class ApiResponse {
  constructor(status, data = "", message = "", succesStatus = 200) {
    this.status = status;
    this.data = data;
    this.message = message;
    this.succesStatus = succesStatus;
  }
}

export default ApiResponse;
