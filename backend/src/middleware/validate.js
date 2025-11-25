const validate = (schema) => {
  return async (req, res, next) => {
    // Use safeParse instead of parse
    const result = await schema.safeParseAsync({
      body: req.body || {},
      query: req.query || {},
      params: req.params || {},
    });

    // Check if validation failed
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Validation passed, continue to next middleware
    next();
  };
};

module.exports = validate;
