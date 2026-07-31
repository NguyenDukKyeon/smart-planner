import { useState } from "react";
import {
  Coins,
  ShieldCheck,
  Gift,
  Plus,
  Sparkles,
  CheckCircle2,
  Coffee,
  Gamepad2,
  Tv,
  BookOpen,
  IceCream,
  ShoppingBag,
  History,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from "canvas-confetti";
import { toast } from "sonner";

type CustomReward = {
  id: string;
  title: string;
  cost: number;
  icon: string;
};

type ClaimedReward = {
  id: string;
  title: string;
  cost: number;
  dateISO: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coins: number;
  streakFreezeCount: number;
  customRewards?: CustomReward[];
  claimedRewards?: ClaimedReward[];
  onBuyStreakFreeze: () => boolean;
  onClaimReward: (reward: { id: string; title: string; cost: number }) => boolean;
  onAddCustomReward: (reward: { title: string; cost: number; icon: string }) => void;
};

const DEFAULT_PRESET_REWARDS: CustomReward[] = [
  { id: "r1", title: "30p Nghe nhạc & Cà phê thư giãn", cost: 20, icon: "☕" },
  { id: "r2", title: "45p Chơi Game / Xem Anime / Phim", cost: 40, icon: "🎮" },
  { id: "r3", title: "1 Chuyến Đi Ăn Kem / Trà Sữa", cost: 35, icon: "🍦" },
  { id: "r4", title: "Mua 1 Cuốn Sách Yêu Thích Mới", cost: 100, icon: "📖" },
  { id: "r5", title: "1 Buổi Tối Giải Trí Hoàn Toàn Tự Do", cost: 60, icon: "🎬" },
];

function emitConfetti(options: Parameters<typeof confetti>[0]) {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  confetti(options);
}

export function RewardShopModal({
  open,
  onOpenChange,
  coins,
  streakFreezeCount,
  customRewards = [],
  claimedRewards = [],
  onBuyStreakFreeze,
  onClaimReward,
  onAddCustomReward,
}: Props) {
  const [newTitle, setNewTitle] = useState("");
  const [newCost, setNewCost] = useState("30");
  const [newIcon, setNewIcon] = useState("🎁");
  const [customRewardError, setCustomRewardError] = useState("");

  const allRewards = [...DEFAULT_PRESET_REWARDS, ...customRewards];

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCustomRewardError("Vui lòng nhập tên phần thưởng.");
      toast.error("Vui lòng nhập tên phần thưởng!");
      return;
    }
    const costNum = Number(newCost);
    if (!Number.isFinite(costNum) || costNum < 5) {
      setCustomRewardError("Số xu phải là một số hữu hạn từ 5 trở lên.");
      toast.error("Số Xu đổi phải từ 5 Xu trở lên!");
      return;
    }

    onAddCustomReward({
      title: newTitle.trim(),
      cost: costNum,
      icon: newIcon || "🎁",
    });

    setNewTitle("");
    setNewCost("30");
    setCustomRewardError("");
    toast.success("Đã thêm phần thưởng tự chọn vào Cửa Hàng!");
  };

  const handleClaim = (r: CustomReward) => {
    if (coins < r.cost) {
      toast.error(`Bạn cần thêm ${r.cost - coins} Xu nữa để đổi phần thưởng này!`);
      return;
    }

    const success = onClaimReward(r);
    if (success) {
      emitConfetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      toast.success(`🎉 Đã đổi thành công: "${r.title}"!`, {
        description: "Hãy tự thưởng cho bản thân một cách thoải mái không tội lỗi nhé!",
      });
    }
  };

  const handleBuyFreeze = () => {
    if (coins < 50) {
      toast.error(`Bạn cần 50 Xu để mua Thẻ bảo vệ chuỗi (hiện có: ${coins} Xu).`);
      return;
    }

    const success = onBuyStreakFreeze();
    if (success) {
      emitConfetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
      toast.success("🛡️ Đã mua 1 Thẻ bảo vệ chuỗi.", {
        description: "Thẻ giúp bảo vệ chuỗi ngày duy trì thói quen khi bạn có một ngày bận.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wider">
              <ShoppingBag size={18} className="text-amber-500" />
              <span>Cửa hàng phần thưởng</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-1.5 border border-amber-200/80 shadow-2xs">
              <Coins size={18} className="text-amber-500 fill-amber-400" />
              <span className="font-mono text-base font-bold text-amber-900">{coins} Xu</span>
            </div>
          </div>

          <DialogTitle className="font-serif text-2xl font-bold text-slate-800 flex items-center gap-2 mt-2">
            Cửa Hàng Đổi Xu & Tự Thưởng
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-sm">
            Biến nỗ lực học tập thành phần thưởng thực tế. Biến thói quen thành niềm vui khao khát
            (Atomic Habits Rule #2 & #4).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="shop" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <TabsTrigger value="shop" className="rounded-xl text-xs font-semibold">
              <Gift size={14} className="mr-1.5 text-amber-500" /> Đổi Phần Thưởng
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl text-xs font-semibold">
              <History size={14} className="mr-1.5 text-indigo-500" /> Lịch Sử Đổi (
              {claimedRewards.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-4 pt-3">
            {/* STREAK FREEZE BANNER CARD */}
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-2xs">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-rose-950 text-base">Thẻ bảo vệ chuỗi</h3>
                      <Badge
                        variant="outline"
                        className="border-rose-300 text-rose-700 bg-white text-[10px]"
                      >
                        Bảo vệ chuỗi
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-xs mt-0.5">
                      Tránh mất chuỗi học tập khi lỡ đột xuất bị ốm hoặc bận việc. Tránh tâm lý nản
                      lòng!
                    </p>
                    <div className="mt-1.5 font-semibold text-xs text-rose-800">
                      🛡️ Hiện có:{" "}
                      <span className="text-rose-900 font-bold">{streakFreezeCount} Thẻ</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBuyFreeze}
                  disabled={coins < 50}
                  className="shrink-0 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-10 px-4 shadow-2xs"
                >
                  <Coins size={14} className="mr-1 text-amber-300 fill-amber-300" /> 50 Xu / 1 Thẻ
                </Button>
              </div>
            </div>

            {/* REWARDS GRID */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Danh Sách Phần Thưởng Tự Thưởng
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allRewards.map((reward) => {
                  const canAfford = coins >= reward.cost;
                  return (
                    <div
                      key={reward.id}
                      className={`rounded-2xl border p-3.5 transition-all flex flex-col justify-between gap-3 ${
                        canAfford
                          ? "border-amber-200/90 bg-amber-50/40 hover:bg-amber-50/90 hover:shadow-2xs"
                          : "border-slate-200 bg-slate-50/60 opacity-80"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs border border-slate-100">
                          {reward.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-slate-800 text-xs leading-snug break-words">
                            {reward.title}
                          </h5>
                          <div className="flex items-center gap-1 text-amber-700 font-mono text-xs font-bold mt-1">
                            <Coins size={12} className="fill-amber-400 text-amber-500" />{" "}
                            {reward.cost} Xu
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleClaim(reward)}
                        disabled={!canAfford}
                        className={`w-full rounded-xl text-xs font-semibold h-8 ${
                          canAfford
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-2xs"
                            : "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed"
                        }`}
                      >
                        {canAfford ? "🎁 Đổi Ngay" : `Thiếu ${reward.cost - coins} Xu`}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ADD CUSTOM REWARD FORM */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 mt-4">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Plus size={14} className="text-indigo-600" /> Thêm Phần Thưởng Cá Nhân Mới
              </h4>
              <form
                onSubmit={handleCreateCustom}
                className="space-y-2.5"
                aria-describedby="custom-reward-error"
                noValidate
              >
                <p id="custom-reward-error" className="text-xs text-destructive" role="alert">
                  {customRewardError}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <Input
                      aria-label="Tên phần thưởng cá nhân"
                      placeholder="VD: Xem 1 tập phim anime..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white"
                      aria-invalid={!!customRewardError}
                      aria-describedby="custom-reward-error"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      aria-label="Số xu đổi phần thưởng"
                      placeholder="Số xu"
                      value={newCost}
                      onChange={(e) => setNewCost(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white w-20 font-mono"
                      min={5}
                      aria-invalid={!!customRewardError}
                      aria-describedby="custom-reward-error"
                    />
                    <select
                      aria-label="Biểu tượng phần thưởng"
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="min-h-11 text-sm rounded-xl bg-white border border-slate-200 px-2"
                    >
                      <option value="🎁">🎁</option>
                      <option value="☕">☕</option>
                      <option value="🎮">🎮</option>
                      <option value="🎬">🎬</option>
                      <option value="🍦">🍦</option>
                      <option value="📖">📖</option>
                      <option value="🍕">🍕</option>
                      <option value="🎧">🎧</option>
                    </select>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full h-8 rounded-xl text-xs font-semibold border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  <Plus size={13} className="mr-1" /> Lưu Vào Cửa Hàng
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="history" className="pt-3">
            {claimedRewards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-xs">
                <Gift className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p>Bạn chưa đổi phần thưởng nào. Hãy chăm chỉ tích lũy Xu nhé!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {claimedRewards.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800">{c.title}</span>
                        <div className="text-[10px] text-slate-400">{c.dateISO}</div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50 text-amber-800 font-mono text-[11px]"
                    >
                      -{c.cost} Xu
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
