import React from 'react';

interface FeedbackEmailProps {
  name: string;
  title: string;
  description: string;
}

const FeedbackEmail: React.FC<FeedbackEmailProps> = ({
  name,
  title,
  description,
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>New Feedback Received</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #9a4a00;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #fff;
            border: 1px solid #e7d7cc;
            border-top: none;
            padding: 24px;
            border-radius: 0 0 8px 8px;
          }
          .field {
            margin-bottom: 16px;
          }
          .field-label {
            font-weight: 600;
            color: #9a4a00;
            margin-bottom: 4px;
          }
          .field-value {
            color: #4a4a4a;
            word-wrap: break-word;
          }
          .description {
            white-space: pre-wrap;
            background: #fbf9f8;
            padding: 12px;
            border-radius: 4px;
            border-left: 3px solid #9a4a00;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h2 style={{ margin: 0 }}>New Feedback Received</h2>
        </div>
        <div className="content">
          <div className="field">
            <div className="field-label">Name:</div>
            <div className="field-value">{name}</div>
          </div>
          <div className="field">
            <div className="field-label">Title:</div>
            <div className="field-value">{title}</div>
          </div>
          <div className="field">
            <div className="field-label">Description:</div>
            <div className="field-value">
              <div className="description">{description}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default FeedbackEmail;

