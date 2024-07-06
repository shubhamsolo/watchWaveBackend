class ApiError extends Error{
    constructor(
        statusCode,
        message ="something wrong",
        errors =[],
        statck =""
    ){
        super(message)
        this.statusCode =statusCode
        this.data=null
        this.message =message
        this.success =false;
        this.errors=errors



//this code is written  so that developer get easy acces where the error is this files
       if(statck){
        this.stack= statck

       }
       else{
        Error.captureStackTrace(this,this.constructor)
       }



    }
}

export {ApiError}