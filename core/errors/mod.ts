/** Generic itsudeno error */
export class ItsudenoError extends Error {
  /** Internal error */
  static readonly Internal = class ItsudenoInternalError extends ItsudenoError {}

  /** Unsupported feature */
  static readonly Unsupported = class ItsudenoUnsupportedError extends ItsudenoError {}

  /** Executable run error */
  static readonly Run = class ItsudenoRunError extends ItsudenoError {}

  /** Template error */
  static readonly Template = class ItsudenoTemplateError extends ItsudenoError {}

  /** Validation error */
  static readonly Validation = class ItsudenoValidationError extends ItsudenoError {}

  /** Vault error */
  static readonly Vault = class ItsudenoVaultError extends ItsudenoError {}

  /** Module error */
  static readonly Module = class ItsudenoModuleError extends ItsudenoError {}

  /** Executor error */
  static readonly Executor = class ItsudenoExecutorError extends ItsudenoError {}

  /** Inventory error */
  static readonly Inventory = class ItsudenoInventoryError extends ItsudenoError {}

  /** Reporter error */
  static readonly Reporter = class ItsudenoReporterError extends ItsudenoError {}

  /** Aborted error */
  static readonly Aborted = class ItsudenoAbortedError extends ItsudenoError {}
}
