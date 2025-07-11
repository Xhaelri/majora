"use client"
import React from 'react'
import SortDropDown from './SortDropDown'
import FilterList from './FilterList'

const FilterBar = () => {
  return (
    <div className='flex items-center justify-between container'>
        <FilterList/>
        <SortDropDown/>
    </div>
  )
}

export default FilterBar