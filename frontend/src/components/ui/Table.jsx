const Table = ({ headers, children }) => (
  <table className='min-w-full divide-y divide-gray-700'>
    <thead className='bg-gray-700'>
      <tr>
        {headers.map((h) => (
          <th
            key={h}
            className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className='bg-gray-800 divide-y divide-gray-700'>{children}</tbody>
  </table>
);

export default Table;
