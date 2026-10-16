"use client";

import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useCarryOver } from "@/hooks/use-daily-log";
import { useTeamMembers } from "@/hooks/use-team-members";
import { getErrorMessage } from "@/lib/api/client";
import type { IsoDate } from "@/lib/api/types";
import { formatDayMedium } from "@/lib/dates";

/** "Copy unfinished tasks from an earlier day" - replaces copy-pasting yesterday's doc tab. */
export function CarryOverButton({ date }: { date: IsoDate }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        ↻ Carry over
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Carry over unfinished tasks"
        description={`Copies every task that is not "Done" into ${formatDayMedium(date)}.`}
      >
        <CarryOverForm date={date} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function CarryOverForm({ date, onDone }: { date: IsoDate; onDone: () => void }) {
  const fromId = useId();
  const memberFieldId = useId();
  // Two optional fields: plain controlled inputs are enough here (no react-hook-form needed).
  const [fromDate, setFromDate] = useState("");
  const [memberId, setMemberId] = useState("");
  const { data: members = [] } = useTeamMembers({ active: true });
  const carryOver = useCarryOver(date);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    carryOver.mutate(
      {
        fromDate: fromDate || null,
        memberId: memberId ? Number(memberId) : null,
      },
      {
        onSuccess: (result) => {
          if (result.fromDate === null) {
            toast.info("There is no earlier day with tasks to copy from.");
            onDone();
            return;
          }
          const from = formatDayMedium(result.fromDate);
          if (result.copied === 0) {
            toast.info(`Nothing new to carry over from ${from}.`);
          } else {
            toast.success(
              `Copied ${result.copied} task${result.copied === 1 ? "" : "s"} from ${from}.`,
            );
          }
          onDone();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id={fromId}
        label="Copy from"
        hint="Leave empty to use the most recent earlier day that has tasks."
      >
        <Input
          id={fromId}
          type="date"
          max={date}
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
        />
      </FormField>

      <FormField id={memberFieldId} label="Team member">
        <Select
          id={memberFieldId}
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
        >
          <option value="">Everyone</option>
          {members.map((member) => (
            <option key={member.id} value={String(member.id)}>
              {member.fullName}
            </option>
          ))}
        </Select>
      </FormField>

      <p className="text-xs text-slate-500">
        Tasks that were already carried over are skipped, so running this twice is safe.
      </p>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={carryOver.isPending}>
          Carry over
        </Button>
      </div>
    </form>
  );
}
