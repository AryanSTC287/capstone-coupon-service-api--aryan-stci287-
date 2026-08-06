function AppSuccess(
  res,
  {
    statusCode = 200,
    message = "Success",
    data = null,
    meta = null,
  } = {}
) {
  const response = {
    responseCode: 0,
    status: "success",
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

export default AppSuccess;