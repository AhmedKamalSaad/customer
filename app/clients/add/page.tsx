import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addClient } from "@/app/lib/actions";

export default function AddClientPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>إضافة عميل جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addClient} className="space-y-4">
            <div>
              <Label htmlFor="name">اسم العميل</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="balance">الرصيد المدين الأولي</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                step="0.01"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bank">البنك</Label>
              <Select name="bank" required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر البنك" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="كاش">كاش</SelectItem>
                  <SelectItem value="بنك البلاد">بنك البلاد</SelectItem>
                  <SelectItem value="بنك الراجحى">بنك الراجحى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">تاريخ المعاملة</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              إضافة العميل
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}