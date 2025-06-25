import type { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/appError"
import logger from "../utils/logger"

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return AppError.badRequest(message)
}

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0]
  const message = `Duplicate field value: ${value}. Please use another value!`
  return AppError.conflict(message)
}

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message)
  const message = `Invalid input data. ${errors.join(". ")}`
  return AppError.badRequest(message)
}

const handleJWTError = () => AppError.unauthorized("Invalid token. Please log in again!")

const handleJWTExpiredError = () => AppError.unauthorized("Your token has expired! Please log in again.")

const sendErrorDev = (err: AppError, res: Response) => {
  // Ensure we have a valid status code
  const statusCode = err.statusCode && err.statusCode >= 100 && err.statusCode <= 599 ? err.statusCode : 500
  
  res.status(statusCode).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  })
}

const sendErrorProd = (err: AppError, res: Response) => {
  // Ensure we have a valid status code
  const statusCode = err.statusCode && err.statusCode >= 100 && err.statusCode <= 599 ? err.statusCode : 500
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(statusCode).json({
      status: err.status || "error",
      message: err.message,
      timestamp: new Date().toISOString(),
    })
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error("ERROR 💥", err)

    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
      timestamp: new Date().toISOString(),
    })
  }
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Ensure statusCode is a valid number
  err.statusCode = (typeof err.statusCode === 'number' && err.statusCode >= 100 && err.statusCode <= 599) ? err.statusCode : 500
  err.status = err.status || "error"

  // Log the error for debugging
  logger.error('Error caught by error handler:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  })

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res)
  } else {
    let error = { ...err }
    error.message = err.message

    // Handle different types of errors using your AppError static methods
    if (error.name === "CastError") error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === "ValidationError") error = handleValidationErrorDB(error)
    if (error.name === "JsonWebTokenError") error = handleJWTError()
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError()

    // Handle Prisma errors
    if (error.code === 'P2002') {
      error = AppError.conflict('A record with this data already exists')
    }
    if (error.code === 'P2025') {
      error = AppError.notFound('Record not found')
    }

    // Handle validation errors from express-validator or similar
    if (error.name === 'ValidationError' || (error.errors && Array.isArray(error.errors))) {
      const messages = error.errors?.map((e: any) => e.msg || e.message).join(', ') || error.message
      error = AppError.badRequest(`Validation failed: ${messages}`)
    }

    sendErrorProd(error, res)
  }
}

export default errorHandler