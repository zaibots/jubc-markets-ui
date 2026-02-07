#!/bin/bash
set -e

# Zaibots Rebrand Script
# Replaces Aave → Zaibots and GHO → AIEN in user-facing text
# Does NOT touch: package imports (@aave/), contract ABIs, on-chain function names

cd /home/openclaw/.openclaw/workspace/jubc-markets-ui

echo "=== Phase 1: Renaming GHO/Gho/gho files and directories ==="

# Rename directories first (deepest first)
# src/components/transactions/SavingsGho -> SavingsAien
# src/modules/reserve-overview/Gho -> Aien
# src/modules/markets/Gho -> Aien
# src/modules/sGho -> sAien

mv src/components/transactions/SavingsGho src/components/transactions/SavingsAien 2>/dev/null || true
mv src/modules/reserve-overview/Gho src/modules/reserve-overview/Aien 2>/dev/null || true
mv src/modules/markets/Gho src/modules/markets/Aien 2>/dev/null || true
mv src/modules/sGho src/modules/sAien 2>/dev/null || true

# Rename files with Gho/gho/GHO in names
find src/ pages/ -type f -name "*Gho*" | while read f; do
  newname=$(echo "$f" | sed 's/Gho/Aien/g')
  mv "$f" "$newname"
  echo "Renamed: $f -> $newname"
done

find src/ pages/ -type f -name "*gho*" | while read f; do
  newname=$(echo "$f" | sed 's/gho/aien/g')
  mv "$f" "$newname"
  echo "Renamed: $f -> $newname"
done

find pages/ -type f -name "*sgho*" | while read f; do
  newname=$(echo "$f" | sed 's/sgho/saien/g')
  mv "$f" "$newname"
  echo "Renamed: $f -> $newname"
done

# Rename public GHO-related files
mv public/gho-group.svg public/aien-group.svg 2>/dev/null || true
mv public/resting-gho-hat-purple.svg public/resting-aien-hat-purple.svg 2>/dev/null || true
mv public/sgho-banner.svg public/saien-banner.svg 2>/dev/null || true

echo "=== Phase 2: Update file references (imports, paths) for renamed files ==="

# Fix all import paths that reference renamed files/dirs
find src/ pages/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i \
  -e 's|/SavingsGho/|/SavingsAien/|g' \
  -e 's|/SavingsGho"|/SavingsAien"|g' \
  -e "s|/SavingsGho'|/SavingsAien'|g" \
  -e 's|reserve-overview/Gho|reserve-overview/Aien|g' \
  -e 's|markets/Gho|markets/Aien|g' \
  -e 's|/sGho/|/sAien/|g' \
  -e 's|/sGho"|/sAien"|g' \
  -e "s|/sGho'|/sAien'|g" \
  -e 's|/ghoUtilities|/aienUtilities|g' \
  -e 's|/gho-group\.svg|/aien-group.svg|g' \
  -e 's|/resting-gho-hat-purple\.svg|/resting-aien-hat-purple.svg|g' \
  -e 's|/sgho-banner\.svg|/saien-banner.svg|g' \
  -e 's|GhoRateTooltip|AienRateTooltip|g' \
  -e 's|GhoBanner|AienBanner|g' \
  -e 's|GhoReserveConfiguration|AienReserveConfiguration|g' \
  -e 's|GhoReserveTopDetails|AienReserveTopDetails|g' \
  -e 's|GhoStakingPanel|AienStakingPanel|g' \
  -e 's|GetGhoToken|GetAienToken|g' \
  -e 's|SavingsGhoProgram|SavingsAienProgram|g' \
  -e 's|SavingsGhoWithdrawModal|SavingsAienWithdrawModal|g' \
  -e 's|SavingsGhoModalDepositContent|SavingsAienModalDepositContent|g' \
  -e 's|SavingsGhoDepositModal|SavingsAienDepositModal|g' \
  -e 's|SavingsGhoWithdrawModalContent|SavingsAienWithdrawModalContent|g' \
  -e 's|SavingsGhoDepositActions|SavingsAienDepositActions|g' \
  -e 's|SavingsGhoWithdrawActions|SavingsAienWithdrawActions|g' \
  -e 's|SavingsGhoCard|SavingsAienCard|g' \
  -e 's|SGhoDepositPanel|SAienDepositPanel|g' \
  -e 's|SGhoHeader|SAienHeader|g' \
  -e 's|SGhoApyChart|SAienApyChart|g' \
  -e 's|SavingsGho|SavingsAien|g' \
  -e 's|SGhoService|SAienService|g' \
  -e 's|sgho-apy|saien-apy|g' \
  -e 's|useSGhoApyHistory|useSAienApyHistory|g' \
  {} +

echo "=== Phase 3: User-facing text replacements ==="

# GHO_SYMBOL and GHO_MINTING_MARKETS etc - these are variable/constant names in source code
# We change the VALUE of GHO_SYMBOL but keep the variable name

# --- GHO → AIEN replacements (user-facing strings, NOT imports) ---
find src/ pages/ public/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.html" \) -exec sed -i \
  -e "s|'GHO'|'AIEN'|g" \
  -e 's|"GHO"|"AIEN"|g' \
  -e "s|Bridge GHO|Bridge AIEN|g" \
  -e "s|Deposit GHO|Deposit AIEN|g" \
  -e "s|Withdraw GHO|Withdraw AIEN|g" \
  -e "s|Withdrawing GHO|Withdrawing AIEN|g" \
  -e "s|savings GHO|savings AIEN|g" \
  -e "s|stk GHO|stk AIEN|g" \
  -e "s|stkGHO|stkAIEN|g" \
  -e "s|stkgho|stkaien|g" \
  -e "s|aGHO|aAIEN|g" \
  -e "s|aBasGHO|aBasAIEN|g" \
  -e "s|abasgho|abasaien|g" \
  -e "s|agho|aaien|g" \
  -e "s|>sGHO<|>sAIEN<|g" \
  -e "s|ROUTES\.sGHO|ROUTES.sAIEN|g" \
  -e "s|sGHO|sAIEN|g" \
  -e "s|/sgho|/saien|g" \
  -e "s|'sgho'|'saien'|g" \
  -e "s|Gho Token|Aien Token|g" \
  -e "s|gho-token-logo|aien-token-logo|g" \
  -e "s|staked-gho|staked-aien|g" \
  -e "s|the GHO supply|the AIEN supply|g" \
  -e "s|gho\.xyz|aien.xyz|g" \
  -e "s|how-gho-works|how-aien-works|g" \
  -e "s|GHO APY|AIEN APY|g" \
  -e "s|symbol === GHO_SYMBOL|symbol === GHO_SYMBOL|g" \
  {} +

# Handle Stake.gho enum references - these reference the @aave/contract-helpers enum, keep as-is
# But update display text using Gho

echo "=== Phase 4: Aave → Zaibots replacements (user-facing text only) ==="

# Key user-facing strings
find src/ pages/ public/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.html" -o -name "*.md" \) -exec sed -i \
  -e "s|appName: 'Aave'|appName: 'Zaibots'|g" \
  -e "s|appUrl: 'https://app.aave.com'|appUrl: 'https://app.zaibots.com'|g" \
  -e "s|Aave - \${title}|Zaibots - \${title}|g" \
  -e "s|Aave - |Zaibots - |g" \
  -e 's|content="@AaveAave"|content="@Zaibots"|g' \
  -e 's|aave governance image|zaibots governance image|g' \
  -e 's|content={`Aave`}|content={`Zaibots`}|g' \
  -e "s|Introducing the Aave mobile app|Introducing the Zaibots mobile app|g" \
  -e "s|Migrate to Aave V3|Migrate to Zaibots V3|g" \
  -e "s|Select Aave Testnet Market|Select Zaibots Testnet Market|g" \
  -e "s|Select Aave Market|Select Zaibots Market|g" \
  -e "s|Aave on Lens|Zaibots on Lens|g" \
  -e "s|Stake Aave|Stake Zaibots|g" \
  -e "s|Unstaking window for Aave|Unstaking window for Zaibots|g" \
  -e "s|Aave Voting Machine|Zaibots Voting Machine|g" \
  -e "s|aave governance|zaibots governance|g" \
  -e "s|Aave DAO|Zaibots DAO|g" \
  -e "s|Aave Chan Initiative (ACI)|Zaibots Chan Initiative (ACI)|g" \
  -e "s|Aave Labs does not|Zaibots Labs does not|g" \
  -e "s|Aave Labs|Zaibots Labs|g" \
  -e "s|Aave Protocol Governance|Zaibots Protocol Governance|g" \
  -e "s|Aave Governance|Zaibots Governance|g" \
  -e "s|Aave Protocol|Zaibots Protocol|g" \
  -e "s|Aave governance|Zaibots governance|g" \
  -e "s|Aave application|Zaibots application|g" \
  -e "s|Aave is an Open Source Protocol|Zaibots is an Open Source Protocol|g" \
  -e "s|address positions in Aave|address positions in Zaibots|g" \
  -e "s|an Aave Protocol|a Zaibots Protocol|g" \
  -e "s|determined by Aave|determined by Zaibots|g" \
  -e "s|controlled by Aave|controlled by Zaibots|g" \
  -e "s|by the Aave|by the Zaibots|g" \
  -e "s|on aave governance|on zaibots governance|g" \
  -e "s|hashtags=Aave|hashtags=Zaibots|g" \
  {} +

# manifest.json
sed -i 's|"short_name": "Aave"|"short_name": "Zaibots"|g' public/manifest.json
sed -i 's|"name": "Aave"|"name": "Zaibots"|g' public/manifest.json

# Token names in TokenList.ts - "name: 'Aave'" for AAVE token entries
# These are token names, keep them - the token IS called "Aave"
# Actually, per the task: change display names. The AAVE token is still called "Aave" as a token name.
# Let's keep token names as "Aave" since that's the actual token name on-chain.

echo "=== Phase 5: Rename public Aave logo files ==="
# Rename Aave logo files
mv public/aave-com-logo-header.svg public/zaibots-logo-header.svg 2>/dev/null || true
mv public/aave-com-opengraph.png public/zaibots-opengraph.png 2>/dev/null || true
mv public/aave-logo-purple.svg public/zaibots-logo-purple.svg 2>/dev/null || true
mv public/aave.svg public/zaibots.svg 2>/dev/null || true
mv public/aaveLogo.svg public/zaibots-logo.svg 2>/dev/null || true
mv public/aave_180.png public/zaibots_180.png 2>/dev/null || true
mv public/aave_santa.svg public/zaibots_santa.svg 2>/dev/null || true

# Update references to renamed logo files
find src/ pages/ public/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.html" \) -exec sed -i \
  -e "s|/aave-com-logo-header\.svg|/zaibots-logo-header.svg|g" \
  -e "s|/aave-com-opengraph\.png|/zaibots-opengraph.png|g" \
  -e "s|aave-com-opengraph\.png|zaibots-opengraph.png|g" \
  -e "s|/aave-logo-purple\.svg|/zaibots-logo-purple.svg|g" \
  -e "s|/aave\.svg|/zaibots.svg|g" \
  -e "s|/aaveLogo\.svg|/zaibots-logo.svg|g" \
  -e "s|/aave_180\.png|/zaibots_180.png|g" \
  -e "s|/aave_santa\.svg|/zaibots_santa.svg|g" \
  -e "s|iconPath.*aave\.svg|iconPath\": \"zaibots.svg|g" \
  {} +

echo "=== Phase 6: Update footer links ==="
# Update social media links to generic/zaibots
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e "s|https://twitter.com/aave|https://twitter.com/zaibots|g" \
  -e "s|https://www.instagram.com/aave/|https://www.instagram.com/zaibots/|g" \
  -e "s|https://www.tiktok.com/@aavelabs|https://www.tiktok.com/@zaibots|g" \
  -e "s|https://www.linkedin.com/company/aavelabs/|https://www.linkedin.com/company/zaibots/|g" \
  -e "s|https://discord.com/invite/aave|https://discord.com/invite/zaibots|g" \
  -e "s|https://dune.com/aavelabs|https://dune.com/zaibots|g" \
  -e "s|https://github.com/aave|https://github.com/zaibots|g" \
  -e "s|https://hey.xyz/u/aave|https://hey.xyz/u/zaibots|g" \
  -e "s|https://aave.com/terms-of-service|https://zaibots.com/terms-of-service|g" \
  -e "s|https://aave.com/privacy-policy/|https://zaibots.com/privacy-policy/|g" \
  -e "s|https://docs.aave.com/hub/|https://docs.zaibots.com/hub/|g" \
  -e "s|https://docs.aave.com/faq/|https://docs.zaibots.com/faq/|g" \
  -e "s|https://aave.com/faq|https://zaibots.com/faq|g" \
  -e "s|https://v2-market.aave.com/|https://v2-market.zaibots.com/|g" \
  -e "s|https://app.aave.com|https://app.zaibots.com|g" \
  -e "s|aave-gho|zaibots-aien|g" \
  {} +

echo "=== Phase 7: Update remaining Aave display text in various places ==="

# Update README branding
sed -i 's|# Aave|# Zaibots|g' README.md
sed -i 's|Aave |Zaibots |g' README.md

# Update package.json display name (not the package name itself)
sed -i 's|"description": ".*"|"description": "Zaibots - Non-custodial liquidity protocol"|g' package.json

echo "=== Phase 8: Token description for AIEN ==="
# Update GHO descriptions to AIEN - Compute Commodity
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e "s|Non-custodial liquidity protocol|Zaibots - Non-custodial liquidity protocol|g" \
  {} +

echo "=== Phase 9: Fix sgho route ==="
# The route '/sgho' appears in Link.tsx - update it
find src/ pages/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e "s|'/sgho'|'/saien'|g" \
  {} +

echo "=== Done with replacements ==="
echo "Checking for remaining 'Aave' references (excluding imports)..."
grep -rn "Aave" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ pages/ | grep -v "from '@aave\|from \"@aave\|@aave/\|AaveV[23]\|AaveSafety\|Aavegotchi\|AaveClient\|AaveProvider\|AaveTokenV3\|AaveSupplyIncentive\|AaveBorrowIncentive\|isAave\|mapAave\|aAave\|stkAave\|bgd-labs\|aave-address-book" | head -30 || true

echo ""
echo "Checking for remaining 'GHO' references (excluding Stake.gho enum)..."
grep -rn "'GHO'\|\"GHO\"" --include="*.ts" --include="*.tsx" src/ pages/ | head -20 || true

echo ""
echo "Script complete!"
