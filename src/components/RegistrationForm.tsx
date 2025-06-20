import { useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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

import emailjs from "@emailjs/browser";

const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
  classType: z.string(),
});

interface RegistrationFormProps {
  classId: string;
  onCancel: () => void;
  onSuccess: () => void;
  bakingClass: any;
}

export function RegistrationForm({
  bakingClass,
  classId,
  onSuccess,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      classType: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const result = await createRegistration({
        classId,
        bakingClass: bakingClass.name,
        name: values.name,
        email: "",
        phone: values.phone,
      });

      if (result.success) {
        toast({
          title: "신청 완료",
          description: "클래스 신청이 완료되었습니다! 바로 연락드리겠습니다.",
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
    } catch (error) {
      toast({
        title: "신청 실패",
        description: "예기치 않은 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      emailjs
        .sendForm(
          "service_assdg6b",
          "template_e0baemk",
          formRef.current as any,
          {
            publicKey: "QTOKax_NCpY8EPile",
          }
        )
        .then(
          () => {
            console.log("SUCCESS!");
          },
          (error) => {
            console.log("FAILED...", error);
          }
        );
    }
  }

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mt-6 space-y-6">
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="form space-y-4"
        >
          <input type="hidden" name="classType" value={bakingClass.name} />
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
