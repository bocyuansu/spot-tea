'use client';

import { useState } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  emptyProductVariant,
  type ProductFormValues,
} from '@/features/admin/products/schemas/product';

// 批次填寫的輸入框允許留空，代表「這個欄位不動」
function toBatchValue(raw: string) {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

type ProductVariantMatrixProps = {
  form: UseFormReturn<ProductFormValues>;
};

export default function ProductVariantMatrix({ form }: ProductVariantMatrixProps) {
  const variants = useFieldArray({ control: form.control, name: 'variants' });

  // 用 useFieldArray 給的 id 當 key，移除某一列之後選取狀態才不會錯位
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchPrice, setBatchPrice] = useState('');
  const [batchStock, setBatchStock] = useState('');

  const selectedCount = variants.fields.filter((field) => selectedIds.includes(field.id)).length;
  const allSelected = variants.fields.length > 0 && selectedCount === variants.fields.length;
  const price = toBatchValue(batchPrice);
  const stock = toBatchValue(batchStock);
  const canApply = price !== null || stock !== null;

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((previous) =>
      checked ? [...previous, id] : previous.filter((selected) => selected !== id),
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? variants.fields.map((field) => field.id) : []);
  }

  // 一列都沒勾就套用到全部，按鈕文字會先說清楚要改幾列
  function applyBatch() {
    const targets = variants.fields
      .map((field, index) => ({ id: field.id, index }))
      .filter(({ id }) => selectedCount === 0 || selectedIds.includes(id));

    for (const { index } of targets) {
      if (price !== null) {
        form.setValue(`variants.${index}.price`, price, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      if (stock !== null) {
        form.setValue(`variants.${index}.stock`, stock, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
        <Field className="w-28">
          <FieldLabel htmlFor="batch-price">批次價格</FieldLabel>
          <Input
            id="batch-price"
            type="number"
            min={0}
            placeholder="不填不動"
            value={batchPrice}
            onChange={(event) => setBatchPrice(event.target.value)}
          />
        </Field>

        <Field className="w-28">
          <FieldLabel htmlFor="batch-stock">批次庫存</FieldLabel>
          <Input
            id="batch-stock"
            type="number"
            min={0}
            placeholder="不填不動"
            value={batchStock}
            onChange={(event) => setBatchStock(event.target.value)}
          />
        </Field>

        <Button type="button" variant="outline" disabled={!canApply} onClick={applyBatch}>
          <Wand2 className="size-4" />
          <span>
            {selectedCount === 0
              ? `一鍵套用到全部 ${variants.fields.length} 列`
              : `一鍵套用到選取的 ${selectedCount} 列`}
          </span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="選取全部規格"
                checked={allSelected}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>淨重（克）</TableHead>
            <TableHead>顯示名稱</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>價格</TableHead>
            <TableHead>庫存</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">移除</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.fields.map((variantField, index) => {
            // 數字欄位用 register + valueAsNumber，空白時才不會被當成字串送出去
            const variantErrors = form.formState.errors.variants?.[index];

            return (
              <TableRow key={variantField.id}>
                <TableCell>
                  <Checkbox
                    aria-label={`選取規格 ${index + 1}`}
                    checked={selectedIds.includes(variantField.id)}
                    onCheckedChange={(checked) => toggleRow(variantField.id, checked)}
                  />
                </TableCell>

                <TableCell className="align-top">
                  <Input
                    type="number"
                    className="w-24"
                    aria-label={`規格 ${index + 1} 的淨重`}
                    aria-invalid={Boolean(variantErrors?.weightGrams)}
                    {...form.register(`variants.${index}.weightGrams`, { valueAsNumber: true })}
                  />
                  {variantErrors?.weightGrams && (
                    <FieldError className="mt-1 text-xs" errors={[variantErrors.weightGrams]} />
                  )}
                </TableCell>

                <TableCell className="align-top">
                  <Input
                    className="w-28"
                    placeholder="禮盒組"
                    aria-label={`規格 ${index + 1} 的顯示名稱`}
                    aria-invalid={Boolean(variantErrors?.label)}
                    {...form.register(`variants.${index}.label`)}
                  />
                  {variantErrors?.label && (
                    <FieldError className="mt-1 text-xs" errors={[variantErrors.label]} />
                  )}
                </TableCell>

                <TableCell className="align-top">
                  <Input
                    className="w-40"
                    placeholder="ALI-OOL-150"
                    aria-label={`規格 ${index + 1} 的 SKU`}
                    aria-invalid={Boolean(variantErrors?.sku)}
                    {...form.register(`variants.${index}.sku`)}
                  />
                  {variantErrors?.sku && (
                    <FieldError className="mt-1 text-xs" errors={[variantErrors.sku]} />
                  )}
                </TableCell>

                <TableCell className="align-top">
                  <Input
                    type="number"
                    className="w-24"
                    aria-label={`規格 ${index + 1} 的價格`}
                    aria-invalid={Boolean(variantErrors?.price)}
                    {...form.register(`variants.${index}.price`, { valueAsNumber: true })}
                  />
                  {variantErrors?.price && (
                    <FieldError className="mt-1 text-xs" errors={[variantErrors.price]} />
                  )}
                </TableCell>

                <TableCell className="align-top">
                  <Input
                    type="number"
                    className="w-20"
                    aria-label={`規格 ${index + 1} 的庫存`}
                    aria-invalid={Boolean(variantErrors?.stock)}
                    {...form.register(`variants.${index}.stock`, { valueAsNumber: true })}
                  />
                  {variantErrors?.stock && (
                    <FieldError className="mt-1 text-xs" errors={[variantErrors.stock]} />
                  )}
                </TableCell>

                <TableCell className="align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`移除規格 ${index + 1}`}
                    disabled={variants.fields.length === 1}
                    onClick={() => {
                      variants.remove(index);
                      toggleRow(variantField.id, false);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => variants.append(emptyProductVariant)}
      >
        <Plus className="size-4" />
        <span>新增規格</span>
      </Button>
    </div>
  );
}
