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

import emailjs from "@emailjs/browser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  classType: z.string().min(1, "품목을 선택해 주세요."),
  phone1: z.string(),
  phone2: z.string(),
  phone3: z.string(),
});

interface CreateFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateForm({ onSuccess }: CreateFormProps) {
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

  async function onSubmit() {
    setIsSubmitting(true);

    emailjs
      .sendForm("service_assdg6b", "template_e0baemk", formRef.current as any, {
        publicKey: "QTOKax_NCpY8EPile",
      })
      .then(
        () => {
          toast({
            title: "신청 완료",
            description:
              "클래스 일정 생성이 완료되었습니다! 바로 연락드리겠습니다.",
            variant: "default",
          });
          onSuccess();
        },
        (error) => {
          console.log("FAILED...", error);
        }
      );
    setIsSubmitting(false);
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
          <input
            type="hidden"
            name="classType"
            value={form.getValues("classType")}
          />
          <input
            type="hidden"
            name="phone"
            value={`${form.watch("phone1")}${form.watch("phone2")}${form.watch("phone3")}`}
          />

          <FormField
            control={form.control}
            name="classType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>클래스 품목</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="품목을 선택해주세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="휘낭시에 3종(초코칩+헤이즐넛/콘푸로스트/콘치즈)">
                      휘낭시에 3종(초코칩+헤이즐넛/콘푸로스트/콘치즈)
                    </SelectItem>
                    <SelectItem value="르뱅쿠키(플레인)">
                      르뱅쿠키(플레인)
                    </SelectItem>
                    <SelectItem value="스콘 2종(초코칩/옥수수 치즈 택1)">
                      스콘 2종(초코칩/옥수수 치즈 택1)
                    </SelectItem>
                    <SelectItem value="과일케이크1호(망고/블루베리 택1)">
                      과일케이크1호(망고/블루베리 택1)
                    </SelectItem>
                    <SelectItem value="마들렌 2종(유자/초코)">
                      마들렌 2종(유자/초코)
                    </SelectItem>
                    <SelectItem value="바나나푸딩+스노우볼쿠키">
                      바나나푸딩+스노우볼쿠키
                    </SelectItem>
                    <SelectItem value="베이글2종(플레인 치즈/옥수수 택1)">
                      베이글2종(플레인 치즈/옥수수 택1)
                    </SelectItem>
                    <SelectItem value="파운드케이크(유자레몬)">
                      파운드케이크(유자레몬)
                    </SelectItem>
                    <SelectItem value="비스코티+사브레">
                      비스코티+사브레
                    </SelectItem>
                    <SelectItem value="소금빵 2종(모카/갈릭)">
                      소금빵 2종(모카/갈릭)
                    </SelectItem>
                    <SelectItem value="쫀득빵 2종(플레인 크림치즈/블루베리 크림치즈)">
                      쫀득빵 2종(플레인 크림치즈/블루베리 크림치즈)
                    </SelectItem>
                    <SelectItem value="단과자빵 2종(팥빵/소세지빵)">
                      단과자빵 2종(팥빵/소세지빵)
                    </SelectItem>
                    <SelectItem value="미니식빵 2종(연유밀크모닝/앙버터 중)">
                      미니식빵 2종(연유밀크모닝/앙버터 중)
                    </SelectItem>
                    <SelectItem value="시나몬 트위스트">
                      시나몬 트위스트
                    </SelectItem>
                    <SelectItem value="이 외 품목">
                      이 외 품목은 카톡채팅 or 전화로 문의해주세요.
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
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
                          const value = e.target.value.replace(/[^0-9]/g, '');
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
                          const value = e.target.value.replace(/[^0-9]/g, '');
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
                          const value = e.target.value.replace(/[^0-9]/g, '');
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
