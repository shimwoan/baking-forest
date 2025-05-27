import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createRegistration } from "@/lib/supabase";
import { Resend } from "resend";

const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
});

interface RegistrationFormProps {
  classId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function RegistrationForm({
  classId,
  onCancel,
  onSuccess,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const result = await createRegistration({
        classId,
        name: values.name,
        email: values.email,
        phone: values.phone,
      });

      if (result.success) {
        toast({
          title: "신청 완료",
          description: "클래스 신청이 완료되었습니다!",
          variant: "default",
        });
        onSuccess();
      } else {
        toast({
          title: "신청 실패",
          description: result.error || "잠시 후 다시 시도해주세요",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.log("err", err);
      toast({
        title: "신청 실패",
        description: "예기치 않은 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      const resend = new Resend("re_T3fHac6v_NBzzvTHzJ9gijdcmdpHowWmH");
      await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: ["shimwoan@gmail.com"],
        subject: "hello world",
        html: "<p>it works!</p>",
      });

      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 px-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> 뒤로
        </Button>
        <h3 className="text-lg font-semibold">신청 양식</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@email.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>전화번호</FormLabel>
                <FormControl>
                  <Input placeholder="010-1234-5678" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리중...
                </>
              ) : (
                "신청 완료"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
