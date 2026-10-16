interface FieldErrorProps {
  id?: string;
  message?: string;
}

/** Red message under an input - like Blade's @error('field') {{ $message }} @enderror */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}
