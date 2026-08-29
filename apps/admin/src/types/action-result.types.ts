/**
 * Result returned by every admin server action.
 *
 * Actions never throw: they return a message the form can surface as a toast,
 * so a failed save is visible instead of silently doing nothing.
 */
export interface ActionResultData {
  errorMessage: string | null;
  successMessage: string | null;
}

/** Starting state for a form bound with useActionState. */
export const EMPTY_ACTION_RESULT: ActionResultData = {
  errorMessage: null,
  successMessage: null,
};
