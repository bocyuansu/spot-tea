'use client';

import { useTransition, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { useCart } from '@/features/cart/components/CartProvider';
import { calculateShippingFee } from '@/features/orders/shipping';
import {
  paymentMethodDescriptions,
  paymentMethodLabels,
  paymentMethods,
} from '@/features/orders/order-status';
import { createOrder } from '@/features/checkout/actions/checkout';
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from '@/features/checkout/schemas/checkout';
import CheckoutSummary from '@/features/checkout/components/CheckoutSummary';

type CheckoutFormProps = {
  defaultRecipientName: string;
};

export default function CheckoutForm({
  defaultRecipientName,
}: CheckoutFormProps) {
  // label 的 htmlFor 與輸入框的 id，同一頁有多個表單實例也不會撞名
  const formId = useId();

  const { items, subtotal, updatePrices } = useCart();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(checkoutFormSchema),
    // user 資料表沒有電話與地址欄位，也沒有地址簿，除了收件人以外都留空讓使用者填
    defaultValues: {
      recipientName: defaultRecipientName,
      phone: '',
      postalCode: '',
      city: '',
      district: '',
      addressLine: '',
      note: '',
      paymentMethod: 'ecpay' as const,
    },
  });

  const shippingFee = calculateShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;

  function onSubmit(values: CheckoutFormValues) {
    startTransition(async () => {
      const result = await createOrder({
        ...values,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        expectedTotal: totalAmount,
      });

      if (!result.ok) {
        // 價格變了：換上最新單價，右側的訂單明細會跟著重算，顧客確認後再送一次
        if (result.latestPrices) updatePrices(result.latestPrices);

        toast.add({
          type: 'error',
          description: result.message,
          priority: 'high',
        });
        return;
      }

      toast.add({
        type: 'success',
        description:
          values.paymentMethod === 'ecpay'
            ? '訂單已成立，請完成付款 !'
            : '訂單已成立 !',
      });

      // 不能用 server 端 redirect（見 proxy.ts 的 1101 說明），一律 client 端導頁。
      // 購物車在完成頁才清空，避免導頁前畫面先閃一下空購物車。
      // 信用卡訂單也先到完成頁再從那裡前往綠界：購物車已清、訂單已保留，
      // 付款失敗或從綠界按上一頁回來時都能在同一頁重付，不會回到結帳頁重複下單
      router.push(`/checkout/complete/${result.orderNumber}`);
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start"
    >
      <div className="flex flex-col gap-6">
        <Card className="[--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="text-xl">收件資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-y-4">
              <Controller
                name="recipientName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={`${formId}-recipientName`}>
                      收件人姓名
                    </FieldLabel>
                    <Input
                      id={`${formId}-recipientName`}
                      autoComplete="shipping name"
                      aria-invalid={fieldState.invalid}
                      placeholder="王小明"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={`${formId}-phone`}>
                      手機號碼
                    </FieldLabel>
                    <Input
                      id={`${formId}-phone`}
                      autoComplete="shipping tel"
                      type="tel"
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                      placeholder="0912345678"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <Controller
                  name="postalCode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={`${formId}-postalCode`}>
                        郵遞區號
                      </FieldLabel>
                      <Input
                        id={`${formId}-postalCode`}
                        autoComplete="shipping postal-code"
                        inputMode="numeric"
                        aria-invalid={fieldState.invalid}
                        placeholder="106"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={`${formId}-city`}>縣市</FieldLabel>
                      <Input
                        id={`${formId}-city`}
                        autoComplete="shipping address-level1"
                        aria-invalid={fieldState.invalid}
                        placeholder="台北市"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="district"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={`${formId}-district`}>
                        鄉鎮市區
                      </FieldLabel>
                      <Input
                        id={`${formId}-district`}
                        autoComplete="shipping address-level2"
                        aria-invalid={fieldState.invalid}
                        placeholder="大安區"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="addressLine"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={`${formId}-addressLine`}>
                      詳細地址
                    </FieldLabel>
                    <Input
                      id={`${formId}-addressLine`}
                      autoComplete="shipping address-line1"
                      aria-invalid={fieldState.invalid}
                      placeholder="信義路四段 1 號 8 樓"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="note"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={`${formId}-note`}>訂單備註</FieldLabel>
                    <Textarea
                      id={`${formId}-note`}
                      rows={3}
                      aria-invalid={fieldState.invalid}
                      placeholder="例如：請用禮盒包裝"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        <Card className="[--card-spacing:--spacing(6)]">
          <CardHeader>
            <CardTitle className="text-xl">付款方式</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Base UI RadioGroup 提供方向鍵切換與單一 tab 停駐，整張卡片都是 label 可以點 */}
            <Controller
              name="paymentMethod"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-label="付款方式"
                >
                  {paymentMethods.map((method) => (
                    <FieldLabel
                      key={method}
                      htmlFor={`${formId}-payment-${method}`}
                    >
                      <Field orientation="horizontal">
                        <RadioGroupItem
                          value={method}
                          id={`${formId}-payment-${method}`}
                        />
                        <FieldContent>
                          <FieldTitle>{paymentMethodLabels[method]}</FieldTitle>
                          <FieldDescription>
                            {paymentMethodDescriptions[method]}
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <CheckoutSummary
        items={items}
        subtotal={subtotal}
        shippingFee={shippingFee}
        totalAmount={totalAmount}
        isPending={isPending}
      />
    </form>
  );
}
