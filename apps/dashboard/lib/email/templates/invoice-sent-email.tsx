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
  color: '#00e5ff',
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
  backgroundColor: '#00e5ff',
  color: '#000',
  padding: '14px 40px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
};

const link = {
  color: '#00e5ff',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#999',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '30px',
};

interface InvoiceEmailProps {
  invoiceNumber: string;
  clientName: string;
  amount: string;
  dueDate: string;
  invoiceUrl?: string;
}

export const InvoiceSentEmail = ({
  invoiceNumber,
  clientName,
  amount,
  dueDate,
  invoiceUrl,
}: InvoiceEmailProps) => (
  <Html>
    <Head />
    <Preview>Invoice #{invoiceNumber} - ${amount}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Invoice #{invoiceNumber}</Heading>
        <Text style={text}>Dear {clientName},</Text>
        <Text style={text}>
          We have issued invoice #{invoiceNumber} for ${amount}. Please find the details below:
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
          <strong>Amount:</strong> ${amount}
        </Text>
        <Text style={text}>
          <strong>Due Date:</strong> {dueDate}
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
          Please make payment by the due date. If you have any questions, please don't hesitate to contact us.
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

export default InvoiceSentEmail;

