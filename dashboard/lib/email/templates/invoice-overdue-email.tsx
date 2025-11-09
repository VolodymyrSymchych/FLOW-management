import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Link,
  Preview,
} from '@react-email/components';

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#1a1a1a',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
};

const h1 = {
  color: '#ff6b4a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#e0e0e0',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
};

const button = {
  backgroundColor: '#ff6b4a',
  color: '#fff',
  padding: '14px 40px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const link = {
  color: '#ff6b4a',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#999',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '30px',
};

interface OverdueReminderProps {
  invoiceNumber: string;
  clientName: string;
  amount: string;
  dueDate: string;
  daysOverdue: number;
  invoiceUrl?: string;
}

export const InvoiceOverdueReminder = ({
  invoiceNumber,
  clientName,
  amount,
  dueDate,
  daysOverdue,
  invoiceUrl,
}: OverdueReminderProps) => (
  <Html>
    <Head />
    <Preview>Overdue Invoice #{invoiceNumber} - ${amount}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Invoice Overdue - Action Required</Heading>
        <Text style={text}>Dear {clientName},</Text>
        <Text style={text}>
          This is a reminder that invoice #{invoiceNumber} for ${amount} is now {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue.
        </Text>
        <Text style={text}>
          The original due date was {dueDate}. Please arrange payment as soon as possible.
        </Text>
        <Section style={buttonContainer}>
          {invoiceUrl && (
            <Button style={button} href={invoiceUrl}>
              View Invoice
            </Button>
          )}
        </Section>
        <Text style={text}>
          <strong>Invoice Number:</strong> {invoiceNumber}
        </Text>
        <Text style={text}>
          <strong>Amount Due:</strong> ${amount}
        </Text>
        <Text style={text}>
          <strong>Days Overdue:</strong> {daysOverdue}
        </Text>
        {invoiceUrl && (
          <Text style={text}>
            If the button doesn't work, copy and paste this link into your browser:
          </Text>
        )}
        {invoiceUrl && (
          <Link href={invoiceUrl} style={link}>
            {invoiceUrl}
          </Link>
        )}
        <Text style={footer}>
          If you have already made payment, please ignore this email. If you have any questions or need to discuss payment arrangements, please contact us immediately.
        </Text>
        <Text style={footer}>
          Best regards,
          <br />
          Project Scope Analyzer Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default InvoiceOverdueReminder;

