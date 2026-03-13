"use client";

import { createProject } from "@/actions/projects";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function CreateProjectDialog() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [type, setType] = useState<string>("SALES");
  const t = useTranslations("Projects");

  const handleTypeChange = (val: React.ChangeEvent<HTMLSelectElement>) => {
    setType(val.target.value);
  };

  async function action(formData: FormData) {
    formData.append("type", type);
    await createProject(formData);
    onOpenChange();
  }

  return (
    <>
      <Button onPress={onOpen} color="primary" className="font-medium">
        {t("new_project")}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <form action={action}>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{t("form.title")}</h3>
                <p className="text-sm text-foreground/60 font-normal">{t("form.description")}</p>
              </ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  label={t("form.name")}
                  name="name"
                  required
                  placeholder={t("form.name_placeholder")}
                  variant="bordered"
                />
                <Select
                  label={t("form.type")}
                  selectedKeys={[type]}
                  onChange={handleTypeChange}
                  variant="bordered"
                >
                  <SelectItem key="SALES">{t("form.type_sales")}</SelectItem>
                  <SelectItem key="ALLIANCE">{t("form.type_alliance")}</SelectItem>
                  <SelectItem key="PROMO">{t("form.type_promo")}</SelectItem>
                  <SelectItem key="RD">{t("form.type_rd")}</SelectItem>
                </Select>

                {type === "SALES" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label={t("form.revenue")}
                      name="revenue"
                      type="number"
                      placeholder="5000000"
                      variant="bordered"
                    />
                    <Input
                      label={t("form.probability")}
                      name="probability"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="50"
                      endContent={<span className="text-foreground/50 text-sm">%</span>}
                      variant="bordered"
                    />
                  </div>
                )}

                <Input
                  label={t("form.duration")}
                  name="duration"
                  type="number"
                  placeholder="3"
                  endContent={<span className="text-foreground/50 text-sm">ヶ月</span>}
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  キャンセル
                </Button>
                <Button type="submit" color="primary">
                  {t("form.submit")}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
