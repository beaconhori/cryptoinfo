#!/usr/bin/env python3
"""各取引所の最終フィールド行の直後にtravelRuleを挿入"""

insertions = {
    # line_number_after_which: travelRule text
    51:  '    travelRule: { solution: "TRUST",       note: "2023年5月30日対応。国内ではCoincheckとのみ直接送受信可" },',
    99:  '    travelRule: { solution: "TRUST",       note: "2023年5月31日対応。国内ではbitFlyerとのみ直接送受信可" },',
    146: '    travelRule: { solution: "Sygna",       note: "2023年5月31日対応。bitFlyer・Coincheckへの直接送金は不可" },',
    185: '    travelRule: { solution: "Sygna",       note: "2023年6月9日対応。bitFlyer・Coincheckへの直接送金は不可" },',
    233: '    travelRule: { solution: "Sygna+TRUST", note: "2024年4月24日よりTRUSTも追加。国内で両ソリューション対応の数少ない取引所" },',
    286: '    travelRule: { solution: "不明",        note: "Bybitグローバルはトラベルルール対応済みだが、日本法人の詳細は未公表" },',
    318: '    travelRule: { solution: "Sygna",       note: "JVCEA加盟。Sygnaネットワーク内の取引所と送受信可" },',
    351: '    travelRule: { solution: "Sygna",       note: "JVCEA加盟。Sygnaネットワーク内の取引所と送受信可" },',
    405: '    travelRule: { solution: "Sygna",       note: "JVCEA加盟。Sygnaネットワーク内の取引所と送受信可" },',
    438: '    travelRule: { solution: "不明",        note: "比較的新しい取引所のため詳細情報未確認" },',
    492: '    travelRule: { solution: "Sygna+TRUST", note: "2024年1月18日よりTRUSTも追加。国内ハブとして機能" },',
    550: '    travelRule: { solution: "不明",        note: "OKX JapanのJVCEA加盟に基づく対応状況は未確認" },',
    612: '    travelRule: { solution: "TRUST",       note: "TRUSTネットワーク正式参加。日本の国内TRUST採用取引所と送受信可" },',
    673: '    travelRule: { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },',
    716: '    travelRule: { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },',
    759: '    travelRule: { solution: "独自対応",    note: "2025年2月24日より全入出金に必須。KuCoin独自システムで対応" },',
    802: '    travelRule: { solution: "独自対応",    note: "複数国の規制当局に登録済み。Notabeneなど独自システムで対応" },',
    845: '    travelRule: { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },',
    888: '    travelRule: { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },',
    927: '    travelRule: { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },',
    966: '    travelRule: { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },',
    1005:'    travelRule: { solution: "独自対応",    note: "香港SFC（証券先物委員会）規制準拠。アジア最大級の規制対応取引所" },',
    1044:'    travelRule: { solution: "不明",        note: "公式のトラベルルール対応状況は未公表" },',
    1080:'    travelRule: { solution: "独自対応",    note: "EU・MiCA規制準拠。欧州最古参取引所として厳格なAML/KYC体制" },',
    1140:'    travelRule: { solution: "不明",        note: "Binance Japanの国内向けトラベルルール対応の詳細は未公表" },',
    1176:'    travelRule: { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },',
    1211:'    travelRule: { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },',
    1247:'    travelRule: { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },',
    1281:'    travelRule: { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },',
    1316:'    travelRule: { solution: "N/A",         note: "DEX（分散型）。KYC不要のため規制対象外" },',
}

with open("src/data/exchanges.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

# 行番号を降順でソート（後ろから挿入することでずれを防ぐ）
for lineno in sorted(insertions.keys(), reverse=True):
    # 0-indexed: line 51 = index 50
    idx = lineno - 1
    lines.insert(idx + 1, insertions[lineno] + "\n")
    print(f"✓ Inserted travelRule after line {lineno}")

with open("src/data/exchanges.ts", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("\nDone!")
