import * as React from 'react';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>Thank you for registering. Please use the following verification code to complete your signup:</p>
      <h2>{otp}</h2>
      <p>This code will expire in 1 hour.</p>
    </div>
  );
}