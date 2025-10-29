import { useEffect, useRef, useState } from "react";
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
  phone1: z.string(),
  phone2: z.string(),
  phone3: z.string(),
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
  const nameInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone1: "010",
      phone2: "",
      phone3: "",
      classType: "",
    },
  });

  useEffect(() => {
    // 모달이 열리면 이름 input에 focus
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const phone = `${values.phone1}${values.phone2}${values.phone3}`;
      const result = await createRegistration({
        classId,
        bakingClass: bakingClass.name,
        name: values.name,
        email: "",
        phone: phone,
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
          <input
            type="hidden"
            name="phone"
            value={`${form.watch("phone1")}${form.watch("phone2")}${form.watch("phone3")}`}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input {...field} ref={nameInputRef} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>전화번호</FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="phone1"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="010"
                        type="tel"
                        maxLength={3}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone2"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="tel"
                        maxLength={4}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone3"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="tel"
                        maxLength={4}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
