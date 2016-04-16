function add_record(action)
{
  log_info = {
      "action" : action,
      "timestamp" : (new Date()).getTime()
  };

	jQuery.post(
    "/add_log",
    log_info
  )
}
