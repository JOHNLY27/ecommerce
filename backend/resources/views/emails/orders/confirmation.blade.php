@component('mail::message')
# Order Confirmation

Thank you for shopping at **PrimeWear**! We have received your order `#{{ $order->id }}` and it is now {{ $order->status }}.

Here is a summary of your recent purchase:

@component('mail::table')
| Item       | Size / Color | Quantity | Price |
| :--------- | :---------- | :------: | ----: |
@foreach($order->items as $item)
| **{{ $item->product->name }}** | {{ $item->size ?? 'N/A' }} / {{ $item->color ?? 'N/A' }} | {{ $item->quantity }} | PHP {{ number_format($item->price * $item->quantity, 2) }} |
@endforeach
@if($order->discount_amount > 0)
| | | **Discount** | - PHP {{ number_format($order->discount_amount, 2) }} |
@endif
| | | **Total** | **PHP {{ number_format($order->total_amount, 2) }}** |
@endcomponent

**Shipping Information:**
- Address: {{ $order->address }}, {{ $order->city }}
- Contact: {{ $order->contact }}
- Payment Method: {{ $order->payment_method }}

@component('mail::button', ['url' => env('FRONTEND_URL', 'http://localhost:5173') . '/orders'])
View Your Orders
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
