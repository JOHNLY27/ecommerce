<?php

namespace App\Mail\Transport;

use Illuminate\Mail\Transport\Transport;
use Swift_Mime_SimpleMessage;
use Illuminate\Support\Facades\Http;

class ResendTransport extends Transport
{
    /**
     * The Resend API key.
     *
     * @var string
     */
    protected $key;

    /**
     * Create a new Resend transport instance.
     *
     * @param  string  $key
     * @return void
     */
    public function __construct($key)
    {
        $this->key = $key;
    }

    /**
     * {@inheritdoc}
     */
    public function send(Swift_Mime_SimpleMessage $message, &$failedRecipients = null)
    {
        $this->beforeSendPerformed($message);

        $payload = [
            'from' => $this->getFrom($message),
            'to' => array_keys($message->getTo()),
            'subject' => $message->getSubject(),
            'html' => $message->getBody(),
        ];

        if ($cc = $message->getCc()) {
            $payload['cc'] = array_keys($cc);
        }

        if ($bcc = $message->getBcc()) {
            $payload['bcc'] = array_keys($bcc);
        }

        if ($replyTo = $message->getReplyTo()) {
            $payload['reply_to'] = array_keys($replyTo);
        }

        $response = Http::withToken($this->key)
            ->withOptions(['verify' => false]) // Disable for local Windows compatibility
            ->post('https://api.resend.com/emails', $payload);

        if (!$response->successful()) {
            throw new \Exception('Resend API error: ' . $response->body());
        }

        return $this->numberOfRecipients($message);
    }

    /**
     * Get the "from" address for the message.
     *
     * @param  Swift_Mime_SimpleMessage  $message
     * @return string
     */
    protected function getFrom(Swift_Mime_SimpleMessage $message)
    {
        $from = $message->getFrom();

        return array_keys($from)[0];
    }
}
