# Companion Naming Standards

## Overview
To ensure consistency across the application, we maintain a strict separation between companion IDs (internal) and display names (UI).

## Standards

### Internal IDs
- **Always lowercase**: `'finn'`, `'sage'`, `'spark'`, `'harmony'`
- Used for: props, state, database storage, API calls
- Example: `companionId="finn"`

### Display Names
- **Always properly capitalized**: `'Finn'`, `'Sage'`, `'Spark'`, `'Harmony'`
- Used for: UI display, user-facing text
- Example: "Welcome! I'm Finn, your learning companion."

## Implementation

### Import the Utilities
```typescript
import { 
  normalizeCompanionId, 
  getCompanionDisplayName, 
  getCompanionInfo 
} from '../../utils/companionUtils';
```

### Common Patterns

#### 1. Passing Companion as Props
```typescript
// ❌ BAD - Manual capitalization
<BentoCard
  companionId={selectedCharacter}
  companionName={selectedCharacter?.charAt(0).toUpperCase() + selectedCharacter?.slice(1)}
/>

// ✅ GOOD - Using utilities
<BentoCard
  companionId={normalizeCompanionId(selectedCharacter)}
  companionName={getCompanionDisplayName(selectedCharacter)}
/>
```

#### 2. Creating Companion Objects
```typescript
// ❌ BAD - Inconsistent handling
companion={{
  id: selectedCharacter || 'finn',
  name: selectedCharacter ? selectedCharacter.charAt(0).toUpperCase() + selectedCharacter.slice(1) : 'Finn',
  personality: 'helpful'
}}

// ✅ GOOD - Using utilities
companion={{
  id: normalizeCompanionId(selectedCharacter),
  name: getCompanionDisplayName(selectedCharacter),
  personality: 'helpful'
}}
```

#### 3. Companion ID Matching
```typescript
// ❌ BAD - Case-sensitive matching
const greetings = {
  'Finn': 'Hello!',
  'Sage': 'Greetings!'
};
return greetings[companion.id];

// ✅ GOOD - Normalized matching
const greetings = {
  'finn': 'Hello!',
  'sage': 'Greetings!'
};
const companionId = companion.id?.toLowerCase() || 'finn';
return greetings[companionId];
```

#### 4. Display in UI
```typescript
// ❌ BAD - Using ID directly
<p>Your companion {companionId} is here to help!</p>

// ✅ GOOD - Using display name
<p>Your companion {getCompanionDisplayName(companionId)} is here to help!</p>
```

## Utility Functions

### `normalizeCompanionId(companion)`
- Converts any companion identifier to lowercase
- Returns `'finn'` as default if input is null/undefined
- Example: `'Finn'` → `'finn'`, `'SAGE'` → `'sage'`

### `getCompanionDisplayName(companionId)`
- Converts companion ID to proper display name
- Returns `'Finn'` as default if input is null/undefined
- Example: `'finn'` → `'Finn'`, `'sage'` → `'Sage'`

### `getCompanionInfo(companion)`
- Returns both normalized ID and display name
- Example: `'FINN'` → `{ id: 'finn', displayName: 'Finn' }`

### `isValidCompanionId(companionId)`
- Checks if a companion ID is valid
- Returns boolean
- Valid IDs: `'finn'`, `'sage'`, `'spark'`, `'harmony'`

## Migration Checklist

When updating existing code:

1. [ ] Add import for companion utilities
2. [ ] Replace manual `.charAt(0).toUpperCase()` with `getCompanionDisplayName()`
3. [ ] Replace manual `.toLowerCase()` with `normalizeCompanionId()`
4. [ ] Ensure companion ID matching uses lowercase keys
5. [ ] Test that display names appear correctly in UI
6. [ ] Verify companion selection still works

## Files That Need Updates

Based on current codebase scan, these files still need updates:
- `AIDiscoverContainer.tsx`
- `AIDiscoverContainerV2.tsx`
- `AIDiscoverContainerV2-JIT.tsx`
- `AIExperienceContainer.tsx`
- `AIExperienceContainerV2.tsx`
- `AILearnContainer.tsx`
- And any other files using manual companion name capitalization

## Benefits

1. **Consistency**: Same display format everywhere
2. **Maintainability**: Single source of truth for companion names
3. **Flexibility**: Easy to add new companions or change display names
4. **Bug Prevention**: No more "Hy" instead of "Hey" due to mismatched IDs
5. **Type Safety**: Utilities provide proper TypeScript types