# Food Orders - Menu Items Summary Feature

## What's New ✅

Added a new "Menu Items Summary" tab to the Food Orders admin page that shows:
- **How many people ordered each menu item**
- **Total quantity ordered for each item**
- **Grouped by meal type** (Breakfast, Lunch, Supper)
- **Filterable by date**

---

## How to Use

### 1. Go to Food Orders Page
- Navigate to: **Admin → Food Orders**

### 2. Switch to "Menu Items Summary" Tab
- Click on the **"Menu Items Summary"** tab
- You'll see a table with all menu items ordered

### 3. Filter by Date (Optional)
- Click the calendar button at the top
- Select a specific date
- See items ordered only for that date

### 4. Filter by Meal Type
- Click **Breakfast**, **Lunch**, or **Supper** buttons
- See items for that specific meal type only
- Click **All** to see everything

---

## What You'll See

### Example Table:

| Menu Item | Meal Type | Total Quantity | Number of Orders |
|-----------|-----------|----------------|------------------|
| Pasta     | Lunch     | 25 items       | 10 people        |
| Rice      | Lunch     | 18 items       | 8 people         |
| Oatmeal   | Breakfast | 15 items       | 15 people        |
| Chicken   | Supper    | 12 items       | 6 people         |

### Understanding the Data:

**Total Quantity**: Total number of items ordered
- Example: If 5 people ordered 2 Pasta each, total = 10 items

**Number of Orders**: How many different people ordered it
- Example: 10 people ordered Pasta (regardless of quantity)

---

## Use Cases

### 1. Kitchen Planning
- See which items are most popular
- Plan ingredient quantities
- Prepare popular items in advance

### 2. Menu Optimization
- Identify best-selling items
- Remove unpopular items
- Adjust pricing based on demand

### 3. Daily Reports
- Select today's date
- See what was ordered for each meal
- Plan for tomorrow based on trends

### 4. Inventory Management
- Track which items run out quickly
- Order more of popular ingredients
- Reduce waste on unpopular items

---

## Features

### ✅ Real-time Data
- Shows current orders
- Updates when new orders come in
- Refreshes every 2 minutes

### ✅ Smart Grouping
- Groups same items together
- Calculates totals automatically
- Sorts by most popular first

### ✅ Multiple Filters
- Filter by date
- Filter by meal type
- Combine both filters

### ✅ Easy to Read
- Color-coded badges
- Clear labels
- Sorted by popularity

---

## Example Scenarios

### Scenario 1: Planning Tomorrow's Lunch
1. Go to Food Orders → Menu Items Summary
2. Select tomorrow's date
3. Click "Lunch" filter
4. See: "Pasta - 25 items - 10 people"
5. **Action**: Prepare 25+ portions of pasta

### Scenario 2: Weekly Menu Review
1. Don't select any date (shows all time)
2. Click "All" to see everything
3. See which items are consistently popular
4. **Action**: Keep popular items, remove unpopular ones

### Scenario 3: Today's Breakfast Count
1. Select today's date
2. Click "Breakfast" filter
3. See all breakfast items ordered
4. **Action**: Prepare exact quantities needed

---

## Technical Details

### Data Source
- Pulls from `food_orders` and `food_order_items` tables
- Joins with `menu_items` to get item names
- Calculates totals in real-time

### Performance
- Optimized queries
- 2-minute cache
- Handles 100+ orders efficiently

### Accuracy
- Shows only confirmed orders
- Excludes cancelled orders
- Updates automatically

---

## Tips

1. **Check Daily**: Review menu items summary every morning
2. **Use Date Filter**: Select specific dates for accurate planning
3. **Compare Meal Types**: See which meal has most variety
4. **Track Trends**: Monitor popular items over time
5. **Plan Ahead**: Use data to prepare for busy days

---

## Benefits

### For Kitchen Staff
- ✅ Know exactly what to prepare
- ✅ Reduce food waste
- ✅ Improve efficiency

### For Management
- ✅ Data-driven menu decisions
- ✅ Better inventory control
- ✅ Cost optimization

### For Planning
- ✅ Accurate forecasting
- ✅ Resource allocation
- ✅ Staff scheduling

---

## Quick Reference

| Action | Steps |
|--------|-------|
| See today's orders | Select today's date → View summary |
| Most popular item | Look at top of the list |
| Breakfast count | Click "Breakfast" filter |
| All time stats | Don't select any date |
| Specific item | Search in the table |

---

## Screenshots Guide

### Tab Navigation
```
[Orders] [Menu Items Summary] ← Click here
```

### Filters
```
[All] [Breakfast] [Lunch] [Supper] ← Click to filter
```

### Table View
```
Menu Item    | Meal Type | Total Qty | People
-------------|-----------|-----------|--------
Pasta        | Lunch     | 25 items  | 10 people
```

---

## Status: ✅ Live & Working

The feature is now available on the Food Orders admin page!

---

**Last Updated**: January 28, 2025
**Location**: Admin → Food Orders → Menu Items Summary Tab
