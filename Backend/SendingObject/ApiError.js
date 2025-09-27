class ApiError {
  constructor(status, data = "", message = "", succesStatus = 400) {
    this.status = status;
    this.data = data;
    this.message = message;
    this.succesStatus = succesStatus;
  }
}

export default ApiError;
