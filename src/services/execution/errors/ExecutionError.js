class ExecutionError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

class CompilationError extends ExecutionError {}
class RuntimeError extends ExecutionError {}
class TimeLimitExceededError extends ExecutionError {}
class MemoryLimitExceededError extends ExecutionError {}
class OutputLimitExceededError extends ExecutionError {}
class SandboxError extends ExecutionError {}
class BackendUnavailableError extends ExecutionError {}

module.exports = {
  ExecutionError,
  CompilationError,
  RuntimeError,
  TimeLimitExceededError,
  MemoryLimitExceededError,
  OutputLimitExceededError,
  SandboxError,
  BackendUnavailableError
};
