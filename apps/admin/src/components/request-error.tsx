// SERVICES //
import { Card, CardContent } from '@/components/ui/card';

interface RequestErrorProps {
  message: string;
  what: string;
}

/**
 * Explains why data could not be loaded, instead of rendering an empty view.
 */
export function RequestError({ message, what }: RequestErrorProps) {
  return (
    <Card>
      <CardContent className="space-y-2 py-6">
        <p className="text-sm font-semibold text-danger">Could not load {what}</p>
        <p className="text-sm text-ink-muted">{message}</p>
        <p className="text-xs text-ink-muted">
          Check that the API is running at {process.env.NEXT_PUBLIC_API_URL} and that you are
          signed in.
        </p>
      </CardContent>
    </Card>
  );
}
