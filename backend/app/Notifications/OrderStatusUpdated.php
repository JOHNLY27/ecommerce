<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class OrderStatusUpdated extends Notification
{
    use Queueable;

    protected $order;
    protected $status;

    public function __construct($order, $status)
    {
        $this->order = $order;
        $this->status = $status;
    }

    public function via($notifiable)
    {
        // use database by default; mail if email configured
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'status' => $this->status,
            'message' => "Your order #{$this->order->id} status is now {$this->status}.",
        ];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Order status updated')
                    ->line("Your order #{$this->order->id} status is now {$this->status}.")
                    ->action('View Order', url("/orders/{$this->order->id}"))
                    ->line('Thank you for shopping with us!');
    }
}
