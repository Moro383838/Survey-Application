const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;

  if (statusCode === 200) statusCode = 500;

  if (statusCode >= 500) {
    console.error("Server Error:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
    });
  } else if (statusCode >= 400) {
    console.warn("Client Error:", {
      message: err.message,
      url: req.originalUrl,
      statusCode,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message: err.message || "حدث خطأ في الخادم",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

module.exports = {
  errorHandler,
  notFound,
};
